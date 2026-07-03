import { html, css } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";
import { getToastService } from "../services/toast-service.js";

export class TransferItemView extends BSLitElement {
  static styles = [
    ...BSLitElement.styles,
    css`
      :host {
        display: block;
      }

      .header {
        display: flex;
        align-items: center;
        margin-bottom: 25px;
      }

      .back-button {
        border-radius: 8px;
        font-size: 3rem;
        cursor: pointer;
        margin-right: 10px;
        padding-bottom: 20px;
        color: black;
        text-decoration: none;
      }

      .content-card {
        background: white;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        padding: 25px;
        margin-top: 20px;
        border: 1px solid #dee2e6;
      }

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
        border-radius: 10px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      }
    `,
  ];

  static properties = {
    item: { type: Object },
    locations: { type: Array },
    _showUnsavedModal: { type: Boolean, state: true },
    _showRecreateModal: { type: Boolean, state: true },
    _showLocationDropdown: { type: Boolean, state: true },
    _locationSearch: { type: String, state: true },
    _selectedLocation: { type: Object, state: true },
    _isSaving: { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.item = null;
    this.locations = [];
    this._showUnsavedModal = false;
    this._hasUnsavedChanges = false;
    this._isSaving = false;
    this._showRecreateModal = false;
    this._showLocationDropdown = false;
    this._locationSearch = "";
    this._selectedLocation = null;

    this._windowClickHandler = () => {
      this._showLocationDropdown = false;
    };

    this._onBeforeUnload = (e) => {
      if (this._hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("beforeunload", this._onBeforeUnload);
    window.addEventListener("click", this._windowClickHandler);
    this._loadLocations();

    if (window.history.state && window.history.state.item) {
      this.item = window.history.state.item;
    } else {
      const itemId = window.location.pathname.split("/").pop();
      this._fetchItemFromApi(itemId);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("beforeunload", this._onBeforeUnload);
    window.removeEventListener("click", this._windowClickHandler);
  }

  _executeNavigation() {
    const targetUrl = window.history.state && window.history.state.backUrl
      ? window.history.state.backUrl
      : "/inventory";

    window.history.pushState({}, "", targetUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  _goBack(e) {
    if (e) e.preventDefault();
    if (this._hasUnsavedChanges) {
      this._showUnsavedModal = true;
    } else {
      this._executeNavigation();
    }
  }

  _confirmLeave() {
    this._hasUnsavedChanges = false;
    this._showUnsavedModal = false;
    this._executeNavigation();
  }

  _openCreateLocation() {
    const currentPath = window.location.pathname; 
    window.history.pushState({ backUrl: currentPath }, "", `/create-locations`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  render() {
    if (!this.item) {
      return html`
        <div class="header">
          <a href="/inventory" class="back-button" @click="${this._goBack}">&#x2039;</a>
        </div>
        <p class="container">Loading item data...</p>
      `;
    }

    const filteredLocations = this.locations.filter((loc) =>
      loc.name.toLowerCase().includes(this._locationSearch.toLowerCase())
    );

    if (!this._selectedLocation && this.item.location && this.locations.length > 0) {
      this._selectedLocation = this.locations.find((l) => l.id === this.item.location);
    }

    return html`
      <div class="header">
        <a href="/inventory" class="back-button" @click="${this._goBack}">&#x2039;</a>
        <h2>Transfer: ${this.item.name}</h2>
      </div>

      <div class="content-card">
        <form @submit="${this._handleFormSubmit}">
          
          <div class="mb-3 dropdown-wrapper">
            <label class="form-label">Select a new location: <span class="text-danger">*</span></label>
            <button
              type="button"
              class="form-control text-start d-flex justify-content-between align-items-center"
              @click=${(e) => {
                e.stopPropagation();
                this._showLocationDropdown = !this._showLocationDropdown;
              }}
            >
              <span class="${this._selectedLocation ? "" : "text-muted"} text-truncate">
                ${this._selectedLocation ? this._selectedLocation.name : "Select a location..."}
              </span>
              <span>▼</span>
            </button>

            ${this._showLocationDropdown
              ? html`
                  <div class="floating-dropdown p-2" @click=${(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      class="form-control form-control-sm mb-2"
                      placeholder="Search..."
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

                      ${filteredLocations.sort((item1, item2) => item1.name.toLowerCase().localeCompare(item2.name.toLowerCase())).map(
                        (loc) => html`
                          <button
                            type="button"
                            class="list-group-item list-group-item-action py-2 px-3 text-start w-100"
                            @click=${() => {
                              this._selectedLocation = loc;
                              this._showLocationDropdown = false;
                              this._hasUnsavedChanges = true;
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

          <div class="d-flex gap-2">
            <button 
              type="submit" 
              class="btn btn-secondary flex-grow-1"
              ?disabled="${this._isSaving}"
            >
              ${this._isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button 
              type="button" 
              class="btn btn-outline-secondary" 
              @click="${this._goBack}"
              ?disabled="${this._isSaving}"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      ${this._showUnsavedModal
        ? html`
            <div class="modal-overlay" @click="${() => (this._showUnsavedModal = false)}">
              <div class="modal-content" @click="${(e) => e.stopPropagation()}">
                <h5 class="mb-3">Unsaved Changes</h5>
                <p class="text-muted">
                  Are you sure you want to leave this page? Your changes will be lost.
                </p>
                <div class="d-flex justify-content-center gap-2 mt-4">
                  <button class="btn btn-danger" @click="${this._confirmLeave}">
                    Leave
                  </button>
                  <button
                    class="btn btn-outline-secondary"
                    @click="${() => (this._showUnsavedModal = false)}"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          `
        : ""}

        ${this._showRecreateModal
        ? html`
            <div class="modal-overlay" @click="${() => (this._showRecreateModal = false)}">
              <div class="modal-content" @click="${(e) => e.stopPropagation()}">
                <h5 class="mb-3">Item Deleted</h5>
                <p class="text-muted">
                  This item was deleted in another tab. Do you want to recreate it with your new location?
                </p>
                <div class="d-flex justify-content-center gap-2 mt-4">
                  <button class="btn btn-success flex-grow-1" @click="${this._handleRecreateConfirm}">
                    Create
                  </button>

                  <button class="btn btn-outline-secondary" @click="${() => { this._showRecreateModal = false; this._executeNavigation(); }}">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          `
        : ""}
    `;
  }

  _handleFormSubmit(e) {
    e.preventDefault();
    this._confirmTransfer();
  }

  async _confirmTransfer() {
    if (!this._selectedLocation) {
      getToastService().showToast("Please select a valid location.", "error");
      return;
    }

    if (this._isSaving) return;
    this._isSaving = true;

    try {
      const locResponse = await fetch(`/api/locations/${this._selectedLocation.id}`);
      if (locResponse.status === 404) {
        getToastService().showToast("The selected location was just deleted in another Tab!", "error");
        this._loadLocations(); 
        this._selectedLocation = null; 
        this._isSaving = false;
        return; 
      }
    } catch (err) {
      console.error("Fehler beim Location-Check:", err);
      this._isSaving = false; 
      return;
    }

    let freshItem = null;

    try {
      const response = await fetch(`/api/items/${this.item.id}`);
      if (response.status === 404) {
        this._showRecreateModal = true;
        this._isSaving = false; 
        return; 
      }

      if (response.ok) {
        freshItem = await response.json();

        if (freshItem.borrowed) {
          getToastService().showToast("Item has been borrowed in another tab!", "error");
          this._hasUnsavedChanges = false; 
          this._executeNavigation();
          return;
        }
      }
    } catch (err) {
      console.error("Fehler beim Check:", err);
      this._isSaving = false;
      return;
    }

    if (freshItem) {
      this.item = { ...freshItem }; 
    }
    this._executeActualPut();
  }

  _loadLocations() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/locations");
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        this.locations = JSON.parse(xhr.responseText);
      }
    });
    xhr.send();
  }

  async _handleRecreateConfirm() {
    this._showRecreateModal = false;
    this._isSaving = true;
    
    const itemToRecreate = { ...this.item };
    const targetLocationId = this._selectedLocation.id;

    try {
      const locResponse = await fetch(`/api/locations/${targetLocationId}`);
      if (locResponse.status === 404) {
        getToastService().showToast("Cannot recreate item: The selected location was also deleted!", "error");
        this._loadLocations();
        this._selectedLocation = null;
        this._isSaving = false;
        return; 
      }
    } catch (err) {
      console.error("Fehler beim Location-Check während Recreate:", err);
      this._isSaving = false;
      return;
    }

    itemToRecreate.location = targetLocationId;
    if (!itemToRecreate.locationHistory) {
      itemToRecreate.locationHistory = [];
    }
    itemToRecreate.locationHistory.unshift({
      locationName: this._selectedLocation.name,
      id: targetLocationId,
      date: new Date().toISOString()
    });

    itemToRecreate.favorite = this.item.favorite === true || this.item.favorite === 'true';
    itemToRecreate.borrowed = false;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/items");
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.addEventListener("load", () => {
      if (xhr.status === 201 || xhr.status === 200 || xhr.status === 204) {
        this._hasUnsavedChanges = false;
        getToastService().showToast("Item successfully recreated with all settings!");
        this._executeNavigation();
      } else {
        getToastService().showToast("Error recreating item: " + xhr.status, "error");
        this._isSaving = false;
      }
    });
    
    xhr.send(JSON.stringify(itemToRecreate));
  }

  _executeActualPut() {
    const newLocId = this._selectedLocation.id;
    if (this.item.location !== newLocId) {
      this.item.location = newLocId;
      this.item.locationHistory.unshift({
        locationName: this._selectedLocation.name,
        id: this._selectedLocation.id,
        date: new Date().toISOString()
      });

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", `/api/items/${this.item.id}`);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.addEventListener("load", () => {
        if (xhr.status === 200 || xhr.status === 204) {
          this._hasUnsavedChanges = false;
          getToastService().showToast("Item moved successfully.");
          this._executeNavigation();
        } else {
          getToastService().showToast("Error moving item: " + xhr.status, "error");
          this._isSaving = false;
        }
      });
      xhr.send(JSON.stringify(this.item));
    } else {
      this._hasUnsavedChanges = false;
      this._isSaving = false; 
      this._executeNavigation();
    }
  }

  async _fetchItemFromApi(itemId) {
    try {
      const response = await fetch(`/api/items/${itemId}`);
      if (response.ok) {
        this.item = await response.json();
      }
    } catch (err) {
      console.error("Error loading item:", err);
    }
  }
}

customElements.define("transfer-item-view", TransferItemView);