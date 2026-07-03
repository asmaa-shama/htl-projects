import { html, css } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";
import { getToastService } from '../services/toast-service.js';

export class EditCategoryView extends BSLitElement {
  static styles = [
    ...BSLitElement.styles,
    css`
      .delete-overlay:hover {
        background: white;
        color: red;
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

      /* CSS für die Popups */
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
              .header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px; 
      }

            .header h1, .header h2, .header span {
        margin: 0;
        line-height: 1; 
      }
    `
  ];

  static properties = {
    categoryId: { type: String },
    _name: { type: String, state: true },
    _showRecreateModal: { type: Boolean, state: true },
    _showDuplicateModal: { type: Boolean, state: true },
    _showUnsavedModal: { type: Boolean, state: true }
  };

  constructor() {
    super();
    this._name = '';
    this._originalName = '';
    this._showRecreateModal = false;
    this._showDuplicateModal = false;
    this._showUnsavedModal = false; 

    this._onBeforeUnload = this._onBeforeUnload.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadCategory();
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
    return this._name !== this._originalName;
  }

  _loadCategory() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/categories/${this.categoryId}`);
    xhr.addEventListener('load', () => {
      try {
        const cat = JSON.parse(xhr.responseText);
        this._name = cat.name || '';
        this._originalName = cat.name || ''; 
      } catch (err) {
        console.error(err);
      }
    });
    xhr.send();
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
    this._originalName = ''; 
    this._showUnsavedModal = false;
    this._goBack();
  }

  _goBack() {
    window.history.pushState({}, "", "/category");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  _handleRecreate() {
    const updatedData = {
      name: this._name.trim(),
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/categories");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        this._originalName = this._name; 
        this._showRecreateModal = false;
        getToastService().showToast("Category successfully recreated!", "success");
        this._goBack();
      } else {
        getToastService().showToast("Error creating category!", "error");
      }
    };
    xhr.send(JSON.stringify(updatedData));
  }

  _save(force = false) {
    if (!this._name || !this._name.trim()) {
      getToastService().showToast('Name is required.', 'error');
      return;
    }

    const xhr = new XMLHttpRequest();
    const url = force ? `/api/categories/${this.categoryId}?force=true` : `/api/categories/${this.categoryId}`;
    
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.addEventListener('load', () => {
      if (xhr.status === 404) {
        this._showRecreateModal = true;
      } 
      else if (xhr.status === 409) {
        this._showDuplicateModal = true;
      } 
      else if (xhr.status < 400) {
        this._originalName = this._name; 
        getToastService().showToast('Category updated successfully');
        this._goBack();
      } else {
        getToastService().showToast('Update failed', 'error');
      }
    });

    xhr.send(JSON.stringify({ name: this._name.trim() }));
  }

  render() {
    return html`
      <div class="container mt-4">
      <div class="header">
       <span  @click=${this._handleBackClick} class="back-button">&#x2039;</span>
        <h2>Edit Category</h2>
        </div>
        <div class="card shadow-sm mx-auto" style="max-width: 600px;">
          <div class="card-body p-4">
            <div class="mb-3">
              <label for="name">Name<span class="text-danger">*</span></label>
              <input id="name" type="text" class="form-control"
                .value=${this._name}
                @input=${(e) => this._name = e.target.value}>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-secondary flex-grow-1" @click=${() => this._save(false)}>Save Changes</button>
              <button class="btn btn-outline-secondary" @click=${this._handleBackClick}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      ${this._showDuplicateModal ? html`
        <div class="modal-overlay" @click=${() => this._showDuplicateModal = false}>
          <div class="modal-content" @click=${e => e.stopPropagation()}>
            <h5 class="mb-3 text-warning">Duplicate Detected</h5>
            <p class="text-muted">A category with this name already exists. Do you still want to save your changes?</p>
            <div class="d-flex justify-content-center gap-2 mt-4">
              <button class="btn btn-warning text-white flex-grow-1" @click=${() => { this._showDuplicateModal = false; this._save(true); }}>
                Save Anyway
              </button>
              <button class="btn btn-outline-secondary" @click=${() => this._showDuplicateModal = false}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      ${this._showRecreateModal ? html`
        <div class="modal-overlay" @click="${() => (this._showRecreateModal = false)}">
          <div class="modal-content" @click="${(e) => e.stopPropagation()}">
            <h5 class="mb-3">Category Deleted</h5>
            <p class="text-muted">
              This category has been deleted in another tab or by another user.
              Would you like to recreate it now?
            </p>
            <div class="d-flex justify-content-center gap-2 mt-4">
              <button class="btn btn-success flex-grow-1" @click="${this._handleRecreate}">
                Create
              </button>
              <button
                class="btn btn-outline-secondary"
                @click="${() => { this._showRecreateModal = false; this._goBack(); }}"
              >
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
    `;
  }
}

customElements.define("edit-category-view", EditCategoryView);