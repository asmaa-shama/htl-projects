import { html, css } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";
import { getToastService } from '../services/toast-service.js';

export class CreateCategoryView extends BSLitElement {
  static styles = [
    ...BSLitElement.styles,
    css`
      .modal-overlay {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.5); z-index: 1060;
        display: flex; align-items: center; justify-content: center;
      }
      .modal-content {
        background: white; padding: 1.5rem; border-radius: 15px;
        max-width: 400px; width: 90%; text-align: center;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15); border: 1px solid #dee2e6;
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
    `,
  ];

  static properties = {
    _name: { type: String },
    _showDuplicateModal: { state: true },
    _pendingCategory: { state: true },
    _showUnsavedModal: { state: true }
  };

  constructor() {
    super();
    this._name = '';
    this._showDuplicateModal = false;
    this._pendingCategory = null;
    this._showUnsavedModal = false;
    
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
    if (this._name && this._name.trim() !== '') {
      e.preventDefault();
      e.returnValue = "You have unsaved changes!";
    }
  }

  _localeSort(array, key) {
    if (!Array.isArray(array)) return [];
    return [...array].sort((a, b) => {
      const valA = key ? a[key] : a;
      const valB = key ? b[key] : b;
      return String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base', numeric: true });
    });
  }

  render() {
    return html`
        <div class="header">
          <span @click="${this._handleBackClick}" class="back-button">&#x2039;</span>
          <h2>Create New Category</h2>
        </div>

        <div class="container mt-4">
          <div class="card shadow-sm mx-auto" style="max-width: 600px;">
              <div class="card-body p-4">
                  <div class="mb-3">
                      <label for="name">Name<span class="text-danger">*</span></label>
                      <input id="name" type="text" class="form-control" placeholder="ex. Tools" .value=${this._name} @input=${(e) => this._onChange(e)}>
                  </div>
                  <div class="d-flex gap-2">
                      <button class="btn btn-secondary flex-grow-1" @click=${() => this._validateData()}>Create</button>
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="${this._handleBackClick}"
                      >
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
            <p class="text-muted">A category with this name already exists. Do you still want to create it?</p>
            <div class="d-flex justify-content-center gap-2 mt-4">
              <button class="btn btn-warning text-white flex-grow-1" @click=${() => { this._showDuplicateModal = false; this._handleCreateCategory(this._pendingCategory, true); }}>
                Create Anyway
              </button>
              <button class="btn btn-outline-secondary" @click=${() => this._showDuplicateModal = false}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      ${this._showUnsavedModal ? html`
        <div class="modal-overlay" @click=${() => this._showUnsavedModal = false}>
          <div class="modal-content" @click=${e => e.stopPropagation()}>
            <h5 class="mb-3 text-danger">Are you sure you want to leave?</h5>
            <p class="text-muted">You have unsaved changes. If you leave, your changes will be lost.</p>
            <div class="d-flex justify-content-center gap-2 mt-4">
              <button class="btn btn-danger flex-grow-1" @click=${() => { this._showUnsavedModal = false; this._name = ''; this._goBack(); }}>
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

  _onChange(e) {
    this._name = e.target.value;
  }

  _handleBackClick(e) {
    if (e) e.preventDefault();
    if (this._name && this._name.trim() !== '') {
      this._showUnsavedModal = true;
    } else {
      this._goBack();
    }
  }

  _validateData() {
    if (!this._name || !this._name.trim()) {
      getToastService().showToast('Name is required.', 'error');
      return;
    }

    const newCategory = {
      name: this._name.trim() 
    };

    this._handleCreateCategory(newCategory);
  }

  _handleCreateCategory(cat, force = false) {
    const xhr = new XMLHttpRequest();
    const url = force ? `/api/categories?force=true` : `/api/categories`;
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.addEventListener("load", () => {
      if (xhr.status == 201) {
        getToastService().showToast('Category created successfully');
        sessionStorage.setItem('newlyCreatedCategoryName', cat.name);
        this._name = ''; 
        this._goBack();
      } else if (xhr.status === 409) {
        this._pendingCategory = cat;
        this._showDuplicateModal = true;
      } else {
        getToastService().showToast("create Category failed", "error");
      }
    });

    xhr.addEventListener("error", () => {
      console.error("Network error");
    });
    xhr.send(JSON.stringify(cat));
  }

  _goBack() {
    const targetUrl = window.history.state && window.history.state.backUrl
      ? window.history.state.backUrl
      : "/category"; 

    window.history.pushState({}, "", targetUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}

customElements.define("create-category-view", CreateCategoryView);