import { html, css } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";
import { getToastService } from "../services/toast-service.js";

export class LocationView extends BSLitElement {
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
        border: 1px solid #dee2e6;
        margin-top: 20px;
      }

      .image-container {
        position: relative;
        display: block;
        width: 100%;
      }

      .img-action-btn {
        position: absolute;
        top: 15px;
        z-index: 10;
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
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s;
      }

      .img-action-btn:hover {
        transform: scale(1.1);
        background: #f8f9fa;
      }

      .edit-overlay {
        right: 15px;
      }

      .delete-overlay {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255, 255, 255, 0.7);
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
        transition: background 0.2s;
        z-index: 10;
      }

      .delete-overlay:hover {
        background: white;
        color: red;
      }

      .placeholder {
        background-color: #f8f9fa;
        border: 1px dashed #e9ecef;
        border-radius: 10px;
        padding: 40px 20px;
        text-align: center;
        color: #6c757d;
        font-style: italic;
        margin-top: 20px;
      }

      .upload-area {
        border: 2px dashed #dee2e6;
        border-radius: 15px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        background-color: #f8f9fa;
      }

      .form-label {
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 0.3rem;
      }

      .optional-label {
        font-weight: normal;
        color: #6c757d;
        font-size: 0.8rem;
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
  margin-left: auto; 
}

    `,
  ];

  static properties = {
    locationId: { type: String },
    _locationData: { type: Object, state: true },
    editModus: { type: Boolean },
    _showUnsavedModal: { type: Boolean, state: true },
    _showRecreateModal: { type: Boolean, state: true },
    _showDuplicateModal: { state: true },
    _pendingLocationData: { state: true }
  };

  constructor() {
    super();
    this.locationId = "";
    this._locationData = null;
    this.editModus = false;
    this._hasUnsavedChanges = false;
    this._showUnsavedModal = false;
    this._showRecreateModal = false;
    this._showDuplicateModal = false;
    this._pendingLocationData = null;
    this._imageToDeleteOnSave = null;

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
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("beforeunload", this._onBeforeUnload);
  }

  willUpdate(changedProperties) {
    if (changedProperties.has("locationId") && this.locationId) {
      this._fetchLocationDetails(this.locationId);
    }
    const state = window.history.state;
    this.editModus = state && state.status === "edit";
  }

  async _fetchLocationDetails(id) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/locations/${id}`);
    xhr.onload = () => {
      if (xhr.status === 200) {
        this._locationData = JSON.parse(xhr.responseText);
        this._imageToDeleteOnSave = null;
      }
    };
    xhr.send();
  }

  _navigateTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  _handleInputChange() {
    this._hasUnsavedChanges = true;
  }

  _handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    this._hasUnsavedChanges = true;
    const formData = new FormData();
    formData.append("image", file);

    const oldImageName = this._locationData?.pic_path;

    const xhr = new XMLHttpRequest();
    const url = oldImageName
      ? `/api/image?oldImage=${encodeURIComponent(oldImageName)}`
      : "/api/image";
    xhr.open("POST", url);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const res = JSON.parse(xhr.responseText);
        this._locationData = {
          ...this._locationData,
          pic_path: res.file,
        };
      } else {
        getToastService().showToast("Error uploading image", "error");
      }
    };
    xhr.send(formData);
  }

  _goBack(e) {
    if (e) e.preventDefault();
    if (this._hasUnsavedChanges) {
      this._showUnsavedModal = true;
    } else {
      this._imageToDeleteOnSave = null;
      this._navigateTo("/locations");
    }
  }

  _confirmLeave() {
    this._hasUnsavedChanges = false;
    this._showUnsavedModal = false;
    this._imageToDeleteOnSave = null;
    this._navigateTo("/locations");
  }

  _handleSave(e) {
    e.preventDefault();

    const updatedData = {
      id: this.locationId,
      name: this.renderRoot.querySelector("#nameInput").value,
      description: this.renderRoot.querySelector("#descInput").value,
      pic_path: this._locationData.pic_path == "" ? null : this._locationData.pic_path,
    };

    if (!updatedData.name) {
      getToastService().showToast("Warning! Name cannot be empty!", "error");
      return;
    }

    this._submitSave(updatedData);
  }

  _submitSave(updatedData, force = false) {
    const xhr = new XMLHttpRequest();
    const url = force ? `/api/locations/${this.locationId}?force=true` : `/api/locations/${this.locationId}`;
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = () => {
      if (xhr.status === 409) {
        this._pendingLocationData = updatedData;
        this._showDuplicateModal = true;
      } else if (xhr.status >= 200 && xhr.status < 300) {
        this._hasUnsavedChanges = false;
        if (this._imageToDeleteOnSave) {
          this._executeServerImageDeletion(this._imageToDeleteOnSave);
        }
        this._navigateTo("/locations");
      } else {
        this._showRecreateModal = true;
      }
    };
    xhr.send(JSON.stringify(updatedData));
  }

  _executeServerImageDeletion(imagePath) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `/api/image/${encodeURIComponent(imagePath)}`);
    xhr.onload = () => {
      if (xhr.status >= 300) {
        console.error("Delayed image deletion failed on backend.");
      }
    };
    xhr.send();
    this._imageToDeleteOnSave = null;
  }

  _handleRecreate() {
    const updatedData = {
      name: this.renderRoot.querySelector("#nameInput").value,
      description: this.renderRoot.querySelector("#descInput").value,
      pic_path: this._locationData.pic_path == "" ? null : this._locationData.pic_path,
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/locations");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (this._imageToDeleteOnSave) {
          this._executeServerImageDeletion(this._imageToDeleteOnSave);
        }
        this._hasUnsavedChanges = false;
        this._showRecreateModal = false;
        this._navigateTo("/locations");
        getToastService().showToast("Location successfully recreated!", "success");
      } else {
        getToastService().showToast("Error creating location!", "error");
      }
    };
    xhr.send(JSON.stringify(updatedData));
  }

  render() {
    if (!this._locationData) {
      return html`
        <div class="header">
          <a href="/locations" class="back-button" @click="${this._goBack}">&#x2039;</a>
        </div>
        <p class="container mt-4">Loading data...</p>
      `;
    }

    return html`
      <div class="container mt-4">
        <div class="header">
          <a href="/locations" class="back-button" @click="${this._goBack}">&#x2039;</a>
          <h2>${this.editModus ? "Edit: " : ""}${this._locationData.name}</h2>
          ${ !this.editModus? 
              html`
                
        <button type="button" class="edit-action-btn edit-overlay" aria-label="Edit Location" @click="${this._enableEditMode}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
          </svg>
        </button>
              `
              : ``

          }
        </div>

        <div class="card content-card shadow-sm mx-auto" style="max-width: 600px;">
          <div class="card-body p-4">
            ${this.editModus ? this._renderEditForm() : this._renderView()}
          </div>
        </div>
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
                  <button class="btn btn-outline-secondary" @click="${() => (this._showUnsavedModal = false)}">
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
                <h5 class="mb-3">Location Deleted</h5>
                <p class="text-muted">
                  This location has been deleted in another tab or by another user.
                  Would you like to recreate it now?
                </p>
                <div class="d-flex justify-content-center gap-2 mt-4">
                  <button class="btn btn-success flex-grow-1" @click="${this._handleRecreate}">
                    Create
                  </button>
                  <button
                    class="btn btn-outline-secondary"
                    @click="${() => { this._showRecreateModal = false; this._navigateTo('/locations'); }}"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          `
        : ""}

      ${this._showDuplicateModal
        ? html`
            <div class="modal-overlay" @click="${() => (this._showDuplicateModal = false)}">
              <div class="modal-content" @click="${(e) => e.stopPropagation()}">
                <h5 class="mb-3 text-warning">Duplicate Detected</h5>
                <p class="text-muted">
                  A location with this name already exists. Do you still want to save your changes?
                </p>
                <div class="d-flex justify-content-center gap-2 mt-4">
                  <button class="btn btn-warning text-white flex-grow-1" @click="${() => { this._showDuplicateModal = false; this._submitSave(this._pendingLocationData, true); }}">
                    Save Anyway
                  </button>
                  <button
                    class="btn btn-outline-secondary"
                    @click="${() => (this._showDuplicateModal = false)}"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          `
        : ""}
    `;
  }

  _renderView() {
    return html`
      <div class="image-container mb-3">
        <div class="ratio ratio-16x9">
          <img
            src="/images/${this._locationData.pic_path == null
              ? "placeholder-Image.png"
              : this._locationData.pic_path}"
            class="rounded object-fit-cover"
          />
        </div>
      </div>

      <p class="mt-3">
        <strong>Description:</strong><br />
        ${this._locationData.description || "No description available."}
      </p>
    `;
  }

  _enableEditMode() {
    window.history.pushState({ status: "edit" }, "", window.location.pathname);
    this.editModus = true;
  }

  _renderEditForm() {
    return html`
      <form @submit="${this._handleSave}">
        ${this._locationData.pic_path != null
          ? html`
              <div class="image-container mb-4">
                <div class="ratio ratio-4x3">
                  <img src="/images/${this._locationData.pic_path}" class="rounded object-fit-cover" alt="${this._locationData.name}" />
                </div>
                <button type="button" class="delete-overlay" aria-label="Close" @click="${this._removeImage}">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            `
          : html`
              <div class="mb-4 text-center">
                <input
                  type="file"
                  id="imageInput"
                  hidden
                  @change="${this._handleFileChange}"
                  accept="image/png, image/jpeg"
                />
                <div
                  class="upload-area"
                  @click=${() => this.renderRoot.querySelector("#imageInput").click()}
                >
                  <div class="text-muted">Upload Image</div>
                </div>
              </div>
            `}

        <div class="mb-3">
          <label class="form-label">Name <span class="text-danger">*</span></label>
          <input
            type="text"
            class="form-control"
            .value="${this._locationData.name}"
            id="nameInput"
            @input="${this._handleInputChange}"
          />
        </div>

        <div class="mb-4">
          <label class="form-label">Description <span class="optional-label">(optional)</span></label>
          <textarea
            class="form-control"
            rows="3"
            id="descInput"
            .value="${this._locationData.description}"
            @input="${this._handleInputChange}"
          ></textarea>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-secondary flex-grow-1">Save Changes</button>
          <button type="button" class="btn btn-outline-secondary" @click="${this._goBack}">
            Cancel
          </button>
        </div>
      </form>
    `;
  }

_removeImage() {
    const oldImage = this._locationData.pic_path;
    if (!oldImage) return;

    if (confirm("Are you sure you want to remove this image?")) {
      this._imageToDeleteOnSave = oldImage; 
      this._locationData = { ...this._locationData, pic_path: null };
      this._hasUnsavedChanges = true;
    }
  }
}

customElements.define("location-details", LocationView);