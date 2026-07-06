import { css, html } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";
import { getToastService } from "../services/toast-service.js";

export class CreateLocationView extends BSLitElement {
  static styles = [
    ...BSLitElement.styles,
    css`
      .image-container {
        position: relative;
        display: inline-block;
        width: 100%;
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
      }

      .delete-overlay:hover {
        background: white;
        color: red;
      }

      :host {
        display: block;
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

      .content-card {
        background: white;
        border-radius: 15px;
        border: 1px solid #dee2e6;
        margin-top: 20px;
      }

      .upload-area {
        border: 2px dashed #ccc;
        border-radius: 10px;
        padding: 30px;
        cursor: pointer;
        background: #f9f9f9;
        transition: border-color 0.2s, background 0.2s;
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
        max-width: 400px; 
        width: 90%; 
        text-align: center;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      }
    `,
  ];

  static properties = {
    _name: { type: String, state: true },
    _description: { type: String, state: true },
    _pic_path: { type: String, state: true }, 
    _deletePic: { type: Boolean, state: true },
    _showDuplicateModal: { state: true },
    _showUnsavedModal: { state: true },
    _pendingLocationData: { state: true }
  };

  constructor() {
    super();
    this._name = '';
    this._description = '';
    this._pic_path = null; 
    this._deletePic = false;
    this._showDuplicateModal = false;
    this._showUnsavedModal = false;
    this._pendingLocationData = null;

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
      (this._name && this._name.trim() !== '') ||
      (this._description && this._description.trim() !== '') ||
      this._pic_path !== null
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
    this._name = '';
    this._description = '';
    this._pic_path = null;
    this._showUnsavedModal = false;
    this._goBack();
  }

  _goBack() {
    const targetUrl = window.history.state && window.history.state.backUrl
      ? window.history.state.backUrl
      : "/inventory"; 

    window.history.pushState({}, "", targetUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  render() {
    return html`
      <div class="header">
        <span @click="${this._handleBackClick}" class="back-button">&#x2039;</span>
        <h2>Create New Location</h2>
      </div>

      <div class="container mt-4">

        <div class="card content-card shadow-sm mx-auto" style="max-width: 600px;">
          <div class="card-body p-4">
            
            <form @submit="${this._handleCreate}">
              
              ${this._pic_path != null
                ? html`
                    <div class="image-container mb-4">
                      <div class="ratio ratio-4x3">
                        <img src="/images/${this._pic_path}" class="rounded object-fit-cover" alt="Preview" />
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
                  placeholder="location name"
                  id="nameInput"
                  .value="${this._name}"
                  @input="${e => this._name = e.target.value}"
                />
              </div>

              <div class="mb-4">
                <label class="form-label">Description <span class="optional-label">(optional)</span></label>
                <textarea
                  class="form-control"
                  rows="3"
                  id="descInput"
                  placeholder="enter a description"
                  .value="${this._description}"
                  @input="${e => this._description = e.target.value}"
                ></textarea>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-secondary flex-grow-1">Create</button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="${this._handleBackClick}"
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>

        ${this._deletePic
          ? html`
              <div class="modal-overlay" @click="${this._closeModal}">
                <div class="modal-content" @click="${(e) => e.stopPropagation()}">
                  <h5 class="mb-3">Delete Picture?</h5>
                  <p class="text-muted">
                    Are you sure you want to remove this Picture?
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

        ${this._showDuplicateModal ? html`
          <div class="modal-overlay" @click="${() => this._showDuplicateModal = false}">
            <div class="modal-content" @click="${(e) => e.stopPropagation()}">
              <h5 class="mb-3 text-warning">Duplicate Detected</h5>
              <p class="text-muted">A location with this name already exists. Do you still want to create it?</p>
              <div class="d-flex justify-content-center gap-2 mt-4">
                <button class="btn btn-warning text-white flex-grow-1" @click="${() => { this._showDuplicateModal = false; this._submitCreate(this._pendingLocationData, true); }}">
                  Create Anyway
                </button>
                <button class="btn btn-outline-secondary" @click="${() => this._showDuplicateModal = false}">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ` : ""}

        ${this._showUnsavedModal ? html`
          <div class="modal-overlay" @click="${() => this._showUnsavedModal = false}">
            <div class="modal-content" @click="${(e) => e.stopPropagation()}">
              <h5 class="mb-3 text-danger">Are you sure you want to leave?</h5>
              <p class="text-muted">You have unsaved changes. If you leave, your changes will be lost.</p>
              <div class="d-flex justify-content-center gap-2 mt-4">
                <button class="btn btn-danger flex-grow-1" @click="${this._clearFormAndLeave}">
                  Leave
                </button>
                <button class="btn btn-outline-secondary" @click="${() => this._showUnsavedModal = false}">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ` : ""}

      </div>
    `;
  }

  _handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const oldImageName = this._pic_path;

    const xhr = new XMLHttpRequest();
    const url = oldImageName
      ? `/api/image?oldImage=${encodeURIComponent(oldImageName)}`
      : "/api/image";
    xhr.open("POST", url);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const res = JSON.parse(xhr.responseText);
        this._pic_path = res.file;
      } else {
        getToastService().showToast("Error uploading image!", "error");
      }
    };
    xhr.send(formData);
  }

  _removeImage() {
    const oldImage = this._pic_path;
    if (!oldImage) return;

    this._deletePic = true; 
  }

  _confirmDelete() {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `/api/image/${encodeURIComponent(this._pic_path)}`);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        this._pic_path = null;
        this._deletePic = false; 
      } else {
        getToastService().showToast("Couldn't delete Picture", "error");
      }
    };
    xhr.send();
  }

  _closeModal() {
    this._deletePic = false; 
  }

  _handleCreate(e) {
    e.preventDefault();

    if (!this._name || !this._name.trim()) {
      getToastService().showToast("Name field shouldn't be empty", "error");
      return;
    }

    const newData = {
      name: this._name.trim(),
      description: this._description ? this._description.trim() : '',
      pic_path: this._pic_path === "" ? null : this._pic_path,
    };

    this._submitCreate(newData);
  }

  _submitCreate(newData, force = false) {
    const xhr = new XMLHttpRequest();
    const url = force ? `/api/locations?force=true` : `/api/locations`;
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.addEventListener("load", () => {
      if (xhr.status === 409) {
        this._pendingLocationData = newData;
        this._showDuplicateModal = true;
      } else if (xhr.status >= 200 && xhr.status < 300) {
        sessionStorage.setItem('newlyCreatedLocationName', newData.name);
        
        this._name = '';
        this._description = '';
        this._pic_path = null;

        this._goBack();
      } else {
        getToastService().showToast("Couldn't create Location!", "error");
      }
    });

    xhr.send(JSON.stringify(newData));
  }
}

customElements.define("create-location-view", CreateLocationView);