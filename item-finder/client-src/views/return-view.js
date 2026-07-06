import { html, css } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";
import { getToastService } from "../services/toast-service.js";

class ReturnItemView extends BSLitElement {
  static properties = {
    itemId: { type: String },
    item: { type: Object },
    lendEntry: { type: Object },
    locations: { type: Array },
    errorStatus: { type: Number },
    _showLocationDropdown: { type: Boolean, state: true },
    _locationSearch: { type: String, state: true },
    _selectedLocation: { type: Object, state: true },
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
      
      .dropdown-wrapper {
        position: relative;
      }
      .floating-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        margin-top: 4px;
      }
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
    this.lendEntry = null;
    this._lastItemId = null;
    this.errorStatus = null;

    this.locations = [];
    this._showLocationDropdown = false;
    this._locationSearch = "";
    this._selectedLocation = null;
    
    this._person = "";
    this._notes = "";
    this._showUnsavedModal = false;
    this._isSaving = false; 

    this._windowClickHandler = () => {
      this._showLocationDropdown = false;
    };
    this._onBeforeUnload = this._onBeforeUnload.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("click", this._windowClickHandler);
    window.addEventListener("beforeunload", this._onBeforeUnload);
    this._loadLocations();
  }

  disconnectedCallback() {
    window.removeEventListener("click", this._windowClickHandler);
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
    const originalPerson = this.lendEntry?.locationName || "";
    const originalNotes = this.lendEntry?.notes || "";

    return (
      this._selectedLocation !== null ||
      this._person !== originalPerson ||
      this._notes !== originalNotes
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
    this._selectedLocation = null;
    this._showUnsavedModal = false;
    this._goBack();
  }

  async _loadLocations() {
    try {
      const response = await fetch("/api/locations");
      if (response.ok) {
        const data = await response.json();
        this.locations = data.sort((a, b) => 
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
      } else {
        console.error("Failed to load locations from API");
      }
    } catch (err) {
      console.error("Network error loading locations:", err);
    }
  }

  _openCreateLocation() {
    const currentPath = window.location.pathname; 
    window.history.pushState({ backUrl: currentPath }, "", `/create-locations`);
    window.dispatchEvent(new PopStateEvent("popstate"));
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
        if (this.item?.locationHistory && this.item.locationHistory.length > 0) {
          this._fetchLoan(this.item.locationHistory);
        } else {
          getToastService().showToast("Für dieses Item existiert kein aktiver Verleih-Eintrag.", "error");
        }
      } else {
        this.errorStatus = response.status;
        getToastService().showToast("Fehler beim Laden der Item-Details.", "error");
      }
    } catch (err) {
      console.error("Error fetching item details:", err);
      this.errorStatus = 500;
      getToastService().showToast("Netzwerkfehler beim Laden des Items.", "error");
    }
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('itemId') && this.itemId) {
      if (this.itemId !== this._lastItemId) {
        this._lastItemId = this.itemId;
        this.lendEntry = null; 
        this.item = null;
        this._selectedLocation = null;
        this._person = "";
        this._notes = "";

        this._fetchItemDetails(this.itemId);
      }
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('lendEntry') && this.lendEntry) {
      this._person = this.lendEntry.locationName || "";
      this._notes = this.lendEntry.notes || "";
    }
  }

  _fetchLoan(history) {
    this.lendEntry = history[0]; 
  }

 async _confirmReturn() {
    if (this._isSaving) return;

    if (!this._selectedLocation) {
      getToastService().showToast("Please select a physical target return location.", "error");
      return;
    }

    if (!this._person || !this._person.trim()) {
      getToastService().showToast("Please provide the name of the person returning the item.", "error");
      return; 
    }

    this._isSaving = true; 

    try {
      const locResponse = await fetch(`/api/locations/${this._selectedLocation.id}`);
      if (locResponse.status === 404) {
        getToastService().showToast("The selected target location was deleted in another tab!", "error");
        this._selectedLocation = null;
        this._isSaving = false;
        this._loadLocations();
        return;
      }
    } catch (err) {
      console.error("Error checking location:", err);
      this._isSaving = false;
      return;
    }

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
        if (!freshItem.borrowed) {
          getToastService().showToast("This item has already been returned in another session.", "error");
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

    let result = null;
    const newInfo = {
      id: this.lendEntry.id,
      person: this._person.trim(),
      notes: this._notes ? this._notes.trim() : ""
    };

    try {
      const response = await fetch(`/api/borrowed`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInfo)
      });

      if (!response.ok) {
        throw new Error("Failed to process updating Entry.");
      }

      result = await response.json();
    } catch (error) {
      getToastService().showToast(error.message, "error");
      this._isSaving = false;
      return;
    }

    try {      
      if (freshItem.locationHistory && freshItem.locationHistory.length > 0) {
        freshItem.locationHistory.shift();
      }

      this.lendEntry.locationName = result.person;
      
      if (!freshItem.locationHistory) freshItem.locationHistory = [];
      freshItem.locationHistory.unshift(this.lendEntry);
      
      freshItem.borrowed = false; 
      freshItem.location = this._selectedLocation.id;

      let newLoc = {
        "locationName": this._selectedLocation.name,
        "date": new Date().toISOString()
      };

      freshItem.locationHistory.unshift(newLoc);

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
        getToastService().showToast("Conflict: Item was modified elsewhere.", "error");
        this._isSaving = false;
        this._goBack();
        return;
      }

      if (putResponse.status === 200 || putResponse.status === 204) {
        getToastService().showToast("Item returned successfully.");
        
        this.item = freshItem;

        this.dispatchEvent(new CustomEvent("item-returned", {
          detail: { item: this.item, entry: result },
          bubbles: true,
          composed: true
        }));

        this._selectedLocation = null;
        this._person = "";
        this._notes = "";

        this._isSaving = false;
        this._goBack();
      } else {
        getToastService().showToast("Error returning item status payload: " + putResponse.status, "error");
        this._isSaving = false;
      }
    }
    catch (error) {
      getToastService().showToast("Error updating item status: " + error.message, "error");
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

    if (!this.item || !this.lendEntry) {
      return html`
        <div class="container mt-4 text-center">
          <div class="spinner-border text-secondary" role="status"></div>
          <p class="text-muted mt-2">Loading data...</p>
        </div>
      `;
    }

    const filteredLocations = this.locations.filter((loc) =>
      loc.name.toLowerCase().includes(this._locationSearch.toLowerCase())
    );

    return html`
      <div class="header">
        <span @click="${this._handleBackClick}" class="back-button">&#x2039;</span>
        <h2>Return Item</h2>
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

          <h3 class="h4 mb-1 fw-bold">${this.item.name}</h3>
          <div class="d-flex gap-3 mb-4 text-muted small">
            <span><i class="bi bi-person-fill me-1"></i> Lending to: ${this.lendEntry.locationName}</span>
          </div>

          <form @submit=${(e) => e.preventDefault()}>
            <div class="mb-3">
              <label class="form-label">Person <span class="text-danger">*</span></label>
              <input 
                type="text" 
                class="form-control" 
                .value="${this._person}"
                @input="${e => this._person = e.target.value}"
                ?disabled="${this._isSaving}"
              >
            </div>

            <div class="mb-3 dropdown-wrapper">
              <label class="form-label">Assign Location: <span class="text-danger">*</span></label>
              <button
                type="button"
                class="form-control text-start d-flex justify-content-between align-items-center"
                @click=${(e) => {
                  e.stopPropagation();
                  this._showLocationDropdown = !this._showLocationDropdown;
                }}
                ?disabled="${this._isSaving}"
              >
                <span class="${this._selectedLocation ? "" : "text-muted"} text-truncate">
                  ${this._selectedLocation ? this._selectedLocation.name : "Select return location ..."}
                </span>
                <span>▼</span>
              </button>

              ${this._showLocationDropdown
                ? html`
                    <div class="floating-dropdown p-2" @click=${(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        class="form-control form-control-sm mb-2"
                        placeholder="Search locations..."
                        .value=${this._locationSearch}
                        @input=${(e) => (this._locationSearch = e.target.value)}
                      />

                      <div class="list-group list-group-flush mb-2" style="max-height: 150px; overflow-y: auto;">
                        <button
                          type="button"
                          class="list-group-item list-group-item-action py-1 px-2 text-primary fw-bold"
                          @click=${() => {
                            this._openCreateLocation();
                            this._showLocationDropdown = false;
                          }}
                        >
                          + Create new location
                        </button>

                        ${filteredLocations.map(
                          (loc) => html`
                            <button
                              type="button"
                              class="list-group-item list-group-item-action py-2 px-3 text-start w-100"
                              @click=${() => {
                                this._selectedLocation = loc;
                                this._showLocationDropdown = false;
                              }}
                            >
                              ${loc.name}
                            </button>
                          `
                        )}
                      </div>
                    </div>
                  `
                : ""}
            </div>
            <div class="mb-4">
              <label class="form-label">Notes <span class="text-muted fw-normal small">(optional)</span></label>
              <textarea 
                class="form-control" 
                rows="3" 
                placeholder="Add comments regarding item condition upon return..." 
                .value="${this._notes}"
                @input="${e => this._notes = e.target.value}"
                ?disabled="${this._isSaving}"
              ></textarea>
            </div>
          </form>

          <div class="d-flex gap-2">
            <button 
              type="button" 
              class="btn btn-secondary flex-grow-1" 
              @click=${(e) => {
                e.stopPropagation();
                this._confirmReturn();
              }}
              ?disabled="${this._isSaving}"
            >
              ${this._isSaving ? "Returning..." : "Return"}
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

customElements.define("return-item-view", ReturnItemView);