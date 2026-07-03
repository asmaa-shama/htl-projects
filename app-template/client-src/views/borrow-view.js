import { html, css } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";
import { getToastService } from "../services/toast-service.js";

class BorrowItemView extends BSLitElement {
  static properties = {
    itemId: { type: String },
    item: { type: Object },
    location: { type: Object },
    errorStatus: { type: Number },
    _person: { type: String, state: true },
    _notes: { type: String, state: true },
    _showUnsavedModal: { type: Boolean, state: true },
    _isSaving: { type: Boolean, state: true } 
  };

  static styles = [
    super.styles,
    css`
      .preview-container { 
        height: 200px; 
        position: relative; 
        overflow: hidden; 
        border-radius: 15px;
        border: 1px solid #dee2e6;
        background-color: #f8f9fa;
      }
      .preview-img { width: 100%; height: 100%; object-fit: cover; }
      .form-label { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.3rem; }
      .card { border-radius: 15px; border: 1px solid #dee2e6; }
      .grow { flex-grow: 1; }
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

      .modal-overlay {
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100vw; 
        height: 100vh;
        background: rgba(0, 0, 0, 0.5); 
        z-index: 1060;
        display: flex; 
        align-items: center; 
        justify-content: center;
      }

      .modal-content {
        background: white; 
        padding: 1.5rem; 
        border-radius: 15px; 
        max-width: 400px; 
        width: 90%; 
        text-align: center;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        border: 1px solid #dee2e6;
      }
    `
  ];

  constructor() {
    super();
    this.itemId = null;
    this.item = null; 
    this.location = null;
    this.errorStatus = null;
    this._person = "";
    this._notes = "";
    this._showUnsavedModal = false;
    this._isSaving = false;

    this._onBeforeUnload = this._onBeforeUnload.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("beforeunload", this._onBeforeUnload);
  }

  disconnectedCallback() {
    window.removeEventListener("beforeunload", this._onBeforeUnload);
    super.disconnectedCallback();
  }

  _onBeforeUnload(e) {
    if (this._hasUnsavedChanges()) {
      e.preventDefault();
      e.returnValue = "You have unsaved changes!";
    }
  }

  _hasUnsavedChanges() {
    return (
      (this._person && this._person.trim() !== "") ||
      (this._notes && this._notes.trim() !== "")
    );
  }

  _handleBackClick(e) {
    if (e) e.preventDefault();
    if (this._hasUnsavedChanges()) {
      this._showUnsavedModal = true;
    } else {
      this._goBack();
    }
  }

  _clearFormAndLeave() {
    this._person = "";
    this._notes = "";
    this._showUnsavedModal = false;
    this._goBack();
  }

  async _fetchItemDetails(id) {
    try {
      this.errorStatus = null; 
      const response = await fetch(`/api/items/${id}`);
      
      if (response.status === 404) {
        this.errorStatus = 404;
        return;
      }

      if (response.ok) {
        this.item = await response.json();
      } else {
        this.errorStatus = response.status;
        console.error("Failed to load item configuration details from API");
      }
    } catch (err) {
      this.errorStatus = 500;
      console.error("Network error fetching item details:", err);
    }
  }

  async _fetchLocationDetails(id) {
    try {
      const response = await fetch(`/api/locations/${id}`);
      if (response.ok) {
        this.location = await response.json();
      } else {
        console.error("Location not found or server error");
      }
    } catch (err) {
      console.error("Error fetching location details:", err);
    }
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('itemId') && this.itemId) {
      this._fetchItemDetails(this.itemId);
    }
    if (changedProperties.has('item') && this.item?.location) {
      this._fetchLocationDetails(this.item.location);
    }
  }

 async _confirmLend() {
    if (this._isSaving) return; 

    if (!this._person || !this._person.trim()) {
      getToastService().showToast("Please enter the name of the person borrowing this item.", "error");
      return;
    }

    this._isSaving = true; 

    let freshItem = null;
    try {
      const checkResponse = await fetch(`/api/items/${this.item.id}`);
      
      if (checkResponse.status === 404) {
        getToastService().showToast("This item no longer exists. It might have been deleted.", "error");
        this._isSaving = false; 
        this._goBack();
        return; 
      }

      if (checkResponse.ok) {
        freshItem = await checkResponse.json();
        if (freshItem.borrowed) {
          getToastService().showToast("Too late! This item was just borrowed by someone else.", "error");
          this._isSaving = false; 
          this._goBack();
          return;
        }
      } else {
        throw new Error("Could not fetch fresh item data");
      }
    } catch (e) {
      console.error("Safety check failed", e);
      this._isSaving = false; 
      return;
    }
    
    const newEntry = {
      person: this._person.trim(),
      date: new Date().toISOString(),
      notes: this._notes ? this._notes.trim() : ""
    };

    let result;
    let locationEntry;

    try {
      const response = await fetch('/api/borrowed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });

      if (!response.ok) throw new Error("Failed to save loan setup.");
      result = await response.json();

      locationEntry = {
        "id": result.id,
        "locationName": result.person,
        "date": result.date
      };
    } catch (error) {
      getToastService().showToast(error.message, "error");
      this._isSaving = false; 
      return;
    }

    try {
      if (!freshItem.locationHistory) {
        freshItem.locationHistory = [];
      }
      
      freshItem.locationHistory.unshift(locationEntry);
      freshItem.borrowed = true;
      freshItem.location = result.id;
      
      const putResponse = await fetch(`/api/items/${freshItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(freshItem)
      });

      if (putResponse.status === 404) {
        getToastService().showToast("Error: The item was deleted by another user.", "error");
        this._isSaving = false;
        this._goBack();
        return;
      }

      if (putResponse.status === 409) {
        getToastService().showToast("Conflict! The item state changed in another session.", "error");
        this._isSaving = false;
        this._goBack();
        return;
      }

      if (putResponse.status === 200 || putResponse.status === 204) {
        getToastService().showToast("Item borrowed successfully.");
        
        this.item = freshItem;

        this._person = "";
        this._notes = "";
        
        this._isSaving = false; 
        this._goBack();
      } else {
        getToastService().showToast("Error updating item: " + putResponse.status, "error");
        this._isSaving = false; 
      }
    } catch (error) {
      getToastService().showToast("Error writing metadata: " + error.message, "error");
      this._isSaving = false; 
    }
  }

  _goBack(e) {
    if (e) e.preventDefault();

    const targetUrl = window.history.state && window.history.state.backUrl
      ? window.history.state.backUrl
      : "/inventory"; 

    window.history.pushState({}, "", targetUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  render() {
    if (this.errorStatus === 404) {
      return html`
        <div class="container mt-4 text-center">
          <div class="alert alert-danger mx-auto" style="max-width: 600px;">
            <h4 class="alert-heading">Item Not Found</h4>
            <p>This item does not exist or has been deleted by another user.</p>
            <hr>
            <button class="btn btn-outline-danger" @click="${this._goBack}">Go Back</button>
          </div>
        </div>
      `;
    }

    if (this.errorStatus) {
      return html`
        <div class="container mt-4 text-center">
          <div class="alert alert-warning mx-auto" style="max-width: 600px;">
            <h4 class="alert-heading">An error occurred</h4>
            <p>Could not fetch item details (Status: ${this.errorStatus}).</p>
            <hr>
            <button class="btn btn-outline-warning" @click="${this._goBack}">Go Back</button>
          </div>
        </div>
      `;
    }

    if (!this.item) {
      return html`
        <div class="container mt-4 text-center">
          <div class="spinner-border text-secondary" role="status"></div>
          <p class="text-muted mt-2">Loading item details...</p>
        </div>
      `;
    }

    return html`
      <div class="header">
        <span @click="${this._handleBackClick}" class="back-button">&#x2039;</span>
        <h2>Lend Item</h2>
      </div>

      <div class="container mt-4">
        <div class="card shadow-sm mx-auto" style="max-width: 600px;">
          <div class="card-body p-4">
            
            <div class="mb-4 text-center">
              <div class="preview-container d-flex align-items-center justify-content-center">
                ${this.item.image 
                  ? html`<img src="${this.item.image}" alt="${this.item.name}" class="preview-img" />`
                  : html`
                      <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="#ccc" />
                        <line x1="0" y1="100%" x2="100%" y2="0" stroke="#ccc" />
                      </svg>
                      <span class="text-muted text-uppercase z-1 small fw-semibold">No Image Available</span>
                    `
                }
              </div>
            </div>

            <h3 class="h4 mb-1 fw-bold">${this.item.name || 'Item Name'}</h3>
            <div class="d-flex gap-3 mb-4 text-muted small">
              <span><i class="bi bi-geo-alt-fill me-1"></i> Base Location: ${this.location?.name || 'Loading location name...'}</span>
            </div>

            <form @submit=${(e) => e.preventDefault()}>
              <div class="mb-3">
                <label class="form-label">Person <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="e.g. Max Mustermann"
                  .value="${this._person}"
                  @input="${e => this._person = e.target.value}"
                  ?disabled="${this._isSaving}" 
                >
              </div>

              <div class="mb-4">
                <label class="form-label">Notes <span class="text-muted fw-normal small">(optional)</span></label>
                <textarea 
                  class="form-control" 
                  rows="3" 
                  placeholder="Type comments or condition on checkout..."
                  .value="${this._notes}"
                  @input="${e => this._notes = e.target.value}"
                  ?disabled="${this._isSaving}"
                ></textarea>
              </div>

              <div class="d-flex gap-2">
                <button 
                  type="button" 
                  class="btn btn-secondary flex-grow-1"
                  @click=${this._confirmLend}
                  ?disabled="${this._isSaving}"
                >
                  ${this._isSaving ? "Lending..." : "Lend"}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="${this._handleBackClick}"
                  ?disabled="${this._isSaving}"
                >
                  Cancel
                </button>
              </div>
            </form>
            
          </div>
        </div>
      </div>

      ${this._showUnsavedModal ? html`
        <div class="modal-overlay" @click=${() => this._showUnsavedModal = false}>
          <div class="modal-content" @click=${e => e.stopPropagation()}>
            <h5 class="mb-3 text-danger">Are you sure you want to leave?</h5>
            <p class="text-muted">You have unsaved changes. If you leave, your changes will be lost.</p>
            <div class="d-flex justify-content-center gap-2 mt-4">
              <button class="btn btn-danger flex-grow-1" @click=${this._clearFormAndLeave}>
                Leave
              </button>
              <button class="btn btn-outline-secondary" @click=${() => this._showUnsavedModal = false}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }
}

customElements.define("borrow-item-view", BorrowItemView);