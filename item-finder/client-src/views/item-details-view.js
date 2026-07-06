import { html, css } from 'lit';
import { BSLitElement } from '../base/bs-lit-element.js';
import { getToastService } from '../services/toast-service.js';

export class ItemDetailsView extends BSLitElement {
  static properties = {
    _item: { state: true },
    _locationName: { state: true },
    _categoryNames: { state: true },
    _borrowDetails: { state: true }
  };

  static styles = [
    super.styles,
    css`
      .detail-img { max-height: 300px; width: 100%; object-fit: cover; border-radius: 10px; }
      .placeholder-box { background-color: #f8f9fa; border: 1px dashed #dee2e6; border-radius: 8px; padding: 1.5rem; }
      .cat-badge { background-color: #6c757d; color: white; padding: 4px 10px; border-radius: 15px; font-size: 0.85rem; margin-right: 5px; display: inline-block; }
      
      :host {
        --dotWidth: 25px;
        --dotSpacing: 150px;
        --active: #9b9b9b;
        --inactive: #9b9b9b;
        --lineHeight: 5px;
      }
      
      /* 1. Der Scroll-Container */
      .flex-parent {
        width: 100%;
        max-width: 1200px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding: 80px 0;
        cursor: grab;
      }
      .flex-parent::-webkit-scrollbar { height: 6px; }
      .flex-parent::-webkit-scrollbar-thumb { background: var(--inactive); border-radius: 10px; }
      
      /* 2. Die Schiene */
      .input-flex-container {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: max-content;
        min-width: 100%;
        padding: 100px 50px;
        position: relative;
      }
      
      /* 3. Die Punkte */
      .input {
        width: var(--dotWidth);
        height: var(--dotWidth);
        background-color: var(--active);
        border-radius: 50%;
        position: relative;
        cursor: pointer;
        flex-shrink: 0;
        margin-right: var(--dotSpacing);
      }
      .input:last-child { margin-right: 0; }

      /* Header & Buttons */
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px; 
      }

      .back-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 2.2rem;       
        font-weight: 700;      
        transform: translateY(-2px); 
        cursor: pointer;
        color: black;
        text-decoration: none;
        line-height: 1;
      }

      .header h1, .header h2, .header span {
        margin: 0;
        line-height: 1; 
      }
      
      /* 4. Die Verbindungslinien */
      .input::before {
        content: '';
        display: block;
        position: absolute;
        top: 50%;
        left: 100%;
        transform: translateY(-50%);
        width: var(--dotSpacing);
        height: var(--lineHeight);
        background-color: var(--active);
      }
      .input:last-child::before { display: none; }
      
      /* 5. Texte an den Punkten */
      .input span {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 0; height: 0;
      }
      .input span::after {
        content: attr(data-year); position: absolute; top: 25px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-weight: 700; color: var(--active);
      }
      .input span::before {
        content: attr(data-info); position: absolute; top: -75px; left: 50%; transform: translateX(-5px) rotate(-45deg); width: 100px; font-size: 13px; line-height: 1.2; color: #424949;
      }
      
      /* 6. Inaktive Zustände */
      .input.active ~ .input,
      .input.active ~ .input::before,
      .input.active::before {
        background-color: var(--inactive);
      }
      
      /* 7. Beschreibungstext */
      .description-flex-container { width: 100%; max-width: 800px; margin-top: 40px; text-align: center; font-size: 1.2rem; color: #424949; }
      .description-flex-container p { display: none; }
      .description-flex-container p.active { display: block; animation: fadeIn 0.5s ease; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

      /* Bearbeiten-Button (vom main) */
      .edit-action-btn {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
        transition: transform 0.2s;
        margin-left: auto; /* Schiebt den Button im Flex-Header ganz nach rechts */
      }
    `
  ];

  constructor() {
    super();
    this._item = null;
    this._locationName = 'Loading...';
    this._categoryNames = [];
    this.locations = [];
    this._borrowDetails = null;
  }

  async firstUpdated() {
    await this._loadItemData();
  }

  async _loadItemData() {
    const id = window.location.pathname.split('/').pop();

    try {
      const [itemRes, locRes, catRes] = await Promise.all([
        fetch(`/api/items/${id}`),
        fetch('/api/locations'),
        fetch('/api/categories')
      ]);

      if (itemRes.status === 404) {
        getToastService().showToast('Item not found or already deleted.', 'error');
        setTimeout(() => window.location.href = '/inventory', 1500);
        return;
      }

      if (!itemRes.ok) throw new Error('Failed to fetch data');

      this._item = await itemRes.json();
      this.locations = await locRes.json();
      const categories = await catRes.json();

      const foundLoc = this._item.locationHistory ? this._item.locationHistory[0] : null;

      if (this._item.borrowed && foundLoc && foundLoc.id) {
        try {
          const borrowRes = await fetch(`/api/borrowed/${foundLoc.id}`);
          if (borrowRes.ok) {
            this._borrowDetails = await borrowRes.json();
            this._locationName = "Lending to " + (this._borrowDetails.locationName || this._borrowDetails.person || "Someone");
          }
        } catch (bErr) {
          console.error("Could not fetch borrow details:", bErr);
          this._locationName = "Lending to Unknown";
        }
      } else if (foundLoc) {
        const matchedLocation = this.locations ? this.locations.find(l => l.id == foundLoc.id) : null;
        this._locationName = matchedLocation ? matchedLocation.name : (foundLoc.name || "No Location");
        this._borrowDetails = null; 
      } else {
        this._locationName = "No Location";
        this._borrowDetails = null;
      }

      this._categoryNames = (this._item.categories || []).map(catId => {
        const foundCat = categories.find(c => c.id === catId);
        return foundCat ? foundCat.name : catId;
      });

    } catch (err) {
      console.error("Error loading item details:", err);
      getToastService().showToast('Error loading details.', 'error');
    }
  }

  render() {
    if (!this._item) {
      return html`
        <div class="container mt-4">
          <div class="d-flex align-items-center mb-3">
            <span class="back-button" @click="${this._goBack}">&#x2039;</span>
          </div>
          <div class="text-center"><div class="spinner-border text-primary"></div></div>
        </div>
      `;
    }

    return html`
      <div class="header">
        <span @click="${this._goBack}" class="back-button">&#x2039;</span>
        <h2>Item Details</h2>
        <button type="button" class="edit-action-btn" aria-label="Edit Item" @click="${this._enableEditMode}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
          </svg>
        </button>
      </div>

      <div class="container mt-4 mb-5">
        <div class="card shadow-sm mx-auto" style="max-width: 700px;">
          <div class="card-body p-4">

            <div class="mb-4 text-center">
              ${this._item.image
                ? html`<img src="${this._item.image}" alt="${this._item.name}" class="detail-img shadow-sm">`
                : html`
                  <div class="placeholder-box d-flex align-items-center justify-content-center" style="height: 200px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#dee2e6" class="bi bi-image" viewBox="0 0 16 16">
                      <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                      <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
                    </svg>
                  </div>
                `
              }
            </div>

            <div class="d-flex justify-content-between align-items-start mb-2">
                <h3 class="m-0">${this._item.name}</h3>
                ${this._item.favorite ? html`<span class="badge bg-warning text-dark fs-6">★ Favorite</span>` : ''}
            </div>

            <p class="text-muted mb-4 fs-5">${this._item.description || html`<span class="fst-italic">No description provided.</span>`}</p>

            <div class="row mb-4">
                <div class="col-sm-6 mb-3 mb-sm-0">
                    <h6 class="text-uppercase text-muted fw-bold mb-1" style="font-size: 0.75rem;">Location</h6>
                    <p class="m-0 fs-5">${this._locationName}</p>
                </div>
                <div class="col-sm-6">
                  <h6 class="text-uppercase text-muted fw-bold mb-1" style="font-size: 0.75rem;">Categories</h6>
                  <div>
                      ${this._categoryNames && this._categoryNames.length > 0
                        ? [...this._categoryNames].sort((item1, item2) => item1.toLowerCase().localeCompare(item2.toLowerCase())).map(c => html`<span class="cat-badge">${c}</span>`)
                        : html`<span class="text-muted fst-italic">None</span>`
                      }
                  </div>
              </div>
            </div>

            <hr class="text-muted">

            <div class="row mt-4">
                <div class="col-12 mb-3">
                    <h6 class="text-uppercase text-muted fw-bold mb-2" style="font-size: 0.75rem;">Borrow Status</h6>
                    <div class="placeholder-box text-center text-muted">
                        ${this._item.borrowed && this._borrowDetails
                          ? html`
                              <div>
                                <span class="text-danger fw-bold d-block mb-1">
                                  Actively lending to: ${this._borrowDetails.person}
                                </span>
                                
                                <span class="text-muted small d-block mb-2">
                                  Date: ${this._borrowDetails.date ? this._borrowDetails.date.substring(0, 10) : 'Unknown'}
                                </span>
                                
                                <div class="p-2 bg-light rounded border-start border-danger border-3 small text-dark">
                                  <strong>Notes:</strong> 
                                  ${this._borrowDetails.notes || html`<span class="text-muted fst-italic">No notes.</span>`}
                                </div>
                              </div>
                            `
                          : html`<span class="text-muted fst-italic">Not lending to anyone at the moment.</span>`
                        }
                    </div>
                </div>
                <div class="col-12">
                    <h6 class="text-uppercase text-muted fw-bold mb-2" style="font-size: 0.75rem;">Location History</h6>
                    <div id="location-history-container" class="box">
                        <div class="flex-parent">
                          <div class="input-flex-container">
                              ${(this._item.locationHistory || []).map(location => {
                                const dateString = location.date ? location.date.substring(0, 10) : 'No Date';
                                const matchedLocation = this.locations ? this.locations.find(l => l.id == location.id) : null;
                                const infoString = matchedLocation ? matchedLocation.name : (location.locationName || location.name || 'Unknown');

                                return html`
                                  <div class="input">
                                    <span data-year="${dateString}" data-info="${infoString}"></span>
                                  </div>
                                `;
                              })}
                          </div>
                      </div>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  _enableEditMode() {
    window.history.pushState({ item: this._item }, "", `/edit/${this._item.id}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  _goBack(e) {
    if (e) e.preventDefault();
    const targetUrl = window.history.state && window.history.state.backUrl
      ? window.history.state.backUrl
      : "/inventory";
    window.history.pushState({}, "", targetUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}

customElements.define('item-details-view', ItemDetailsView);