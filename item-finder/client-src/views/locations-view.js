import { html, css } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";
import "../components/location-card.js";
import { getToastService } from "../services/toast-service.js";

export class LocationsView extends BSLitElement {
  static styles = [
    ...BSLitElement.styles,
    css`
      :host {
        display: block;
        padding: 0;
        margin: 0;
      }

      .row {
        margin: 0;
      }

      .modal-title {
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 10px;
        color: #212529;
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
        max-width: 450px;
        width: 90%;
        text-align: center;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      }

      .form-select {
        display: block;
        width: 100%;
        padding: 0.375rem 2.25rem 0.375rem 0.75rem;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
        background-color: #fff;
        border: 1px solid #ced4da;
        border-radius: 0.25rem;
      }
      
      .item-scroll-container {
        max-height: 200px;
        overflow-y: auto;
        padding-right: 5px;
        border: 1px solid #e9ecef;
        border-radius: 5px;
        background: #f8f9fa;
      }
    `,
  ];

  static properties = {
    locations: { type: Array },
    _selectedLocation: { type: Object, state: true },
    _itemsInLocationCount: { type: Number, state: true },
    _showTransferModal: { type: Boolean, state: true },
    _itemsToMove: { type: Array, state: true },
    _transferMode: { type: String, state: true },
  };

  constructor() {
    super();
    this.locations = [];
    this._selectedLocation = null;
    this._itemsInLocationCount = 0;
    this._showTransferModal = false;
    this._itemsToMove = [];
    this._transferMode = "all";
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadLocations();
  }

  render() {
    return html`
      <div id="locations" class="container mt-2 border rounded p-3">
        <div class="d-flex align-items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-card-list me-2" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
          </svg>
          <p class="m-0 fs-4"> Locations</p>
        </div>

        <div class="container-fluid">
          <div
            class="row"
            @request-delete="${this._handleDeleteRequest}"
            @edit-location="${this._handleEditRequest}"
            @location-selected="${this._handleLocationOpen}"
          >
            ${this.locations
              .sort((item1, item2) => item1.name.toLowerCase().localeCompare(item2.name.toLowerCase()))
              .map(
                (location) => html`
                  <div class="col-sm mb-3">
                    <location-card .location=${location}></location-card>
                  </div>
                `
              )}
          </div>
        </div>

        ${this._selectedLocation && !this._showTransferModal
          ? html`
              <div class="modal-overlay" @click="${this._closeModal}">
                <div class="modal-content" @click="${(e) => e.stopPropagation()}">
                  <h5 class="mb-3 text-danger">Delete Location?</h5>
                  <p class="text-muted">
                    Are you sure you want to permanently delete <strong>${this._selectedLocation.name}</strong>?
                  </p>
                  <div class="d-flex justify-content-center gap-2 mt-4">
                    <button class="btn btn-danger" @click="${this._confirmDelete}">
                      Delete
                    </button>
                    <button class="btn btn-outline-secondary" @click="${this._closeModal}">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            `
          : ""}

        ${this._showTransferModal && this._selectedLocation
          ? html`
              <div class="modal-overlay" @click="${this._closeModal}">
                <div class="modal-content" style="max-width: 500px;" @click="${(e) => e.stopPropagation()}">
                  <h5 class="mb-3 text-warning">Location contains Items!</h5>
                  <p class="text-muted">
                    There are still <strong>${this._itemsInLocationCount} Items</strong> in 
                    <strong>${this._selectedLocation.name}</strong>. How do you want to transfer them?
                  </p>

                  <div class="d-flex justify-content-center gap-4 mb-4">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="transferMode" id="modeAll" 
                        ?checked="${this._transferMode === 'all'}" @change="${() => this._updateTransferMode('all')}">
                      <label class="form-check-label" for="modeAll">All together</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="transferMode" id="modeSingle" 
                        ?checked="${this._transferMode === 'single'}" @change="${() => this._updateTransferMode('single')}">
                      <label class="form-check-label" for="modeSingle">Individually</label>
                    </div>
                  </div>

                  ${this._transferMode === 'all'
                    ? html`
                        <div class="mb-4">
                          <select id="targetLocationSelectAll" class="form-select">
                            <option value="" disabled selected>Choose target location...</option>
                            ${this.locations
                              .filter((loc) => loc.id !== this._selectedLocation.id)
                              .map((loc) => html`<option value="${loc.id}">${loc.name}</option>`)}
                          </select>
                        </div>
                      `
                    : html`
                        <div class="item-scroll-container text-start mb-4 p-2">
                          ${this._itemsToMove.map((item) => html`
                            <div class="mb-2 p-2 border rounded bg-white shadow-sm">
                              <div class="small fw-bold text-truncate text-dark">${item.name}</div>
                              <select class="form-select form-select-sm mt-1 item-target-select" data-item-id="${item.id}">
                                <option value="" disabled selected>Select target...</option>
                                ${this.locations
                                  .filter((loc) => loc.id !== this._selectedLocation.id)
                                  .map((loc) => html`<option value="${loc.id}">${loc.name}</option>`)}
                              </select>
                            </div>
                          `)}
                        </div>
                      `}

                  <div class="d-flex justify-content-center gap-2 mt-4">
                    <button class="btn btn-warning text-white flex-grow-1" @click="${this._processTransfer}">
                      Transfer & Delete
                    </button>
                    <button class="btn btn-outline-secondary" @click="${this._closeModal}">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            `
          : ""}
      </div>
    `;
  }

  _updateTransferMode(mode) {
    this._transferMode = mode;
    this.requestUpdate();
  }

  _handleDeleteRequest(e) {
    const targetLocation = e.detail.location;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/items");

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const allItems = JSON.parse(xhr.responseText);

        this._itemsToMove = allItems.filter(
          (item) => item.locationId === targetLocation.id || item.location === targetLocation.id
        );
        this._itemsInLocationCount = this._itemsToMove.length;
        this._selectedLocation = targetLocation;
        this._transferMode = "all";

        if (this._itemsInLocationCount > 0) {
          this._showTransferModal = true;
        } else {
          this._showTransferModal = false;
        }
      } else {
        getToastService().showToast("Error checking location contents.", "error");
      }
    });
    xhr.send();
  }

async _processTransfer() {
    if (this._transferMode === "all") {
      const selectElement = this.renderRoot.querySelector("#targetLocationSelectAll");
      const targetLocationId = selectElement ? selectElement.value : "";

      if (!targetLocationId) {
        getToastService().showToast("Please select a target location!", "error");
        return;
      }

      const transferPromises = this._itemsToMove.map((item) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", `/api/items/${item.id}`);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject();
          
          xhr.send(JSON.stringify({ location: targetLocationId }));
        });
      });

      try {
        await Promise.all(transferPromises);
        this._confirmDelete();
      } catch (err) {
        getToastService().showToast("Error transferring some items.", "error");
      }

    } else {
      const selectElements = this.renderRoot.querySelectorAll(".item-target-select");
      const transferPromises = [];
      let allValid = true;

      selectElements.forEach((select) => {
        const itemId = select.getAttribute("data-item-id");
        const targetLocId = select.value;

        if (!targetLocId) {
          allValid = false;
        } else {
          const p = new Promise((resolve, reject) => {
            const xhr2 = new XMLHttpRequest();
            xhr2.open("PUT", `/api/items/${itemId}`);
            xhr2.setRequestHeader("Content-Type", "application/json");
            xhr2.onload = () => (xhr2.status >= 200 && xhr2.status < 300) ? resolve() : reject();
            
            xhr2.send(JSON.stringify({ location: targetLocId }));
          });
          transferPromises.push(p);
        }
      });

      if (!allValid) {
        getToastService().showToast("Please assign a location to ALL items!", "error");
        return;
      }

      try {
        await Promise.all(transferPromises);
        this._confirmDelete();
      } catch (err) {
        getToastService().showToast("Some items could not be transferred.", "error");
      }
    }
  }

  _confirmDelete() {
    const id = this._selectedLocation.id;
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `/api/locations/${id}`);

    xhr.addEventListener("load", () => {
      if (xhr.status === 404) {
        getToastService().showToast("Too late! Location no longer exists.", "error");
        this.locations = this.locations.filter((i) => i.id != id);
        return;
      }

      if (xhr.status >= 400) {
        getToastService().showToast("Error deleting location.", "error");
        return;
      }

      getToastService().showToast("Location deleted successfully.");
      this.locations = this.locations.filter((i) => i.id != id);
    });

    xhr.send();
    this._closeModal();
  }

  _closeModal() {
    this._selectedLocation = null;
    this._showTransferModal = false;
    this._itemsInLocationCount = 0;
    this._itemsToMove = [];
  }

  _handleLocationOpen(e) {
    const id = e.detail.location.id;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/locations/${id}`);
    xhr.addEventListener("load", () => {
      if (xhr.status === 404) {
        getToastService().showToast("Too late! This location no longer exists.", "error");
        this.locations = this.locations.filter((loc) => loc.id != id);
        return;
      }
      window.history.pushState({ status: "show" }, "", `/location/${id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    xhr.send();
  }

  _handleEditRequest(e) {
    const id = e.detail.location.id;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/locations/${id}`);
    xhr.addEventListener("load", () => {
      if (xhr.status === 404) {
        getToastService().showToast("Too late! This location no longer exists.", "error");
        this.locations = this.locations.filter((loc) => loc.id != id);
        return;
      }
      window.history.pushState({ status: "edit" }, "", `/location/${id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    xhr.send();
  }

  _loadLocations() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/locations");
    xhr.addEventListener("load", () => {
      try {
        this.locations = JSON.parse(xhr.responseText);
      } catch (err) {
        console.error("Error parsing locations:", err);
      }
    });
    xhr.send();
  }
}

customElements.define("locations-view", LocationsView);