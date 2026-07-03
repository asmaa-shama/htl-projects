import { html, css } from 'lit';
import { BSLitElement } from '../base/bs-lit-element.js';
import { getToastService } from '../services/toast-service.js';

let categoriesData;

export class EditItemView extends BSLitElement {
  static properties = {
    _name: { state: true },
    _description: { state: true },
    _selectedCategories: { state: true },
    _imagePreview: { state: true },
    _categories: { state: true },
    _categorySearch: { state: true },
    _showCategoryDropdown: { state: true },
    _saving: { state: true },
    _showDuplicateModal: { state: true },
    _showRecreateModal: { state: true },
    _showUnsavedModal: { state: true }, 
    _rawItem: { state: true }, 
    itemId: { type: String }
  };

  static styles = [
    super.styles,
    css`
      .upload-area {
        border: 2px dashed #dee2e6;
        border-radius: 15px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        background-color: #f8f9fa;
      }
      .preview-img { max-height: 150px; border-radius: 10px; }
      .form-label { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.3rem; }
      .optional-label { font-weight: normal; color: #6c757d; font-size: 0.8rem; }
      .card { border-radius: 15px; border: 1px solid #dee2e6; }
      .dropdown-wrapper { position: relative; }
      .floating-dropdown {
        position: absolute; top: 100%; left: 0; right: 0; z-index: 1050;
        background: white; border: 1px solid #dee2e6; border-radius: 0.375rem;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15); margin-top: 0.25rem;
      }
      .cat-badge {
        background-color: #6c757d; color: white; padding: 2px 8px;
        border-radius: 10px; font-size: 0.75rem; margin-right: 4px;
        display: inline-block; margin-bottom: 2px;
      }

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
    `
  ];

  constructor() {
    super();
    this._name = '';
    this._description = '';
    this._selectedCategories = [];
    this._imagePreview = null;
    this._categorySearch = '';
    this._showCategoryDropdown = false;
    this._saving = false;
    this._showDuplicateModal = false;
    this._showRecreateModal = false;
    this._showUnsavedModal = false;
    this._rawItem = null;
    this.itemId = null;

    const rawCategories = categoriesData ? (Array.isArray(categoriesData) ? categoriesData : [categoriesData]) : [];
    this._categories = rawCategories.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    this._closeDropdowns = () => {
      this._showCategoryDropdown = false;
    };

    this._beforeUnloadHandler = (e) => {
      if (this._hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
  }

  _hasUnsavedChanges() {
    if (!this._rawItem) return false;

    const originalName = this._rawItem.name || '';
    const originalDescription = this._rawItem.description || '';
    const originalImage = this._rawItem.image || null;
    
    const originalCatIds = Array.isArray(this._rawItem.categories) 
      ? [...this._rawItem.categories].sort() 
      : [];
    const currentCatIds = this._selectedCategories.map(c => c.id || c.name).sort();

    const nameChanged = this._name !== originalName;
    const descriptionChanged = this._description !== originalDescription;
    const imageChanged = this._imagePreview !== originalImage;
    const categoriesChanged = JSON.stringify(originalCatIds) !== JSON.stringify(currentCatIds);

    return nameChanged || descriptionChanged || imageChanged || categoriesChanged;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._closeDropdowns);
    window.addEventListener('beforeunload', this._beforeUnloadHandler);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._closeDropdowns);
    window.removeEventListener('beforeunload', this._beforeUnloadHandler);
    super.disconnectedCallback();
  }

  firstUpdated() {
    this._fetchCategories();
    if (this.itemId) {
      this._fetchItemData();
    }
  }

  _sortSelectedCategories(categories) {
    return [...categories].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }

  _fetchItemData() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/items/${this.itemId}`);
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          this._rawItem = data; 
          this._name = data.name || '';
          this._description = data.description || '';
          this._imagePreview = data.image || null;
          
          if (data.categories && this._categories.length > 0) {
            const filtered = this._categories.filter(c => data.categories.includes(c.id) || data.categories.includes(c.name));
            this._selectedCategories = this._sortSelectedCategories(filtered);
          }
        } catch (err) { console.error("Parse error item data", err); }
      }
    });
    xhr.send();
  }

  _fetchCategories() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/categories'); 
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          const catArray = Array.isArray(data) ? data : [data];
          this._categories = catArray.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
          
          if (this.itemId) {
             const xhrItem = new XMLHttpRequest();
             xhrItem.open('GET', `/api/items/${this.itemId}`);
             xhrItem.addEventListener('load', () => {
               if (xhrItem.status === 200) {
                 const itemData = JSON.parse(xhrItem.responseText);
                 this._rawItem = itemData; 
                 if (itemData.categories) {
                    const filtered = this._categories.filter(c => itemData.categories.includes(c.id) || itemData.categories.includes(c.name));
                    this._selectedCategories = this._sortSelectedCategories(filtered);
                 }
               }
             });
             xhrItem.send();
          }
        } catch (err) { console.error("Parse error categories", err); }
      }
    });
    xhr.send();
  }

  _toggleCategory(cat) {
    const isSelected = this._selectedCategories.some(c => (c.id || c.name) === (cat.id || cat.name));
    if (isSelected) {
      this._selectedCategories = this._selectedCategories.filter(c => (c.id || c.name) !== (cat.id || cat.name));
    } else {
      this._selectedCategories = this._sortSelectedCategories([...this._selectedCategories, cat]);
    }
  }

  async _saveItem(force = false) {
    if (this._saving) return;
    if (!this._name) {
      getToastService().showToast('Please fill in Name.', 'error');
      return;
    }

    this._saving = true;

    const updatedItem = {
      ...(this._rawItem || {}),
      name: this._name,
      description: this._description,
      categories: this._selectedCategories.map(c => c.id || c.name),
      image: this._imagePreview
    };

    try {
      const url = force ? `/api/items/${this.itemId}?force=true` : `/api/items/${this.itemId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });

      if (response.status === 409) {
        this._showDuplicateModal = true;
        this._saving = false;
        return;
      }

      if (response.status === 404) {
        this._showRecreateModal = true;
        this._saving = false;
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this._rawItem = updatedItem; 
      
      getToastService().showToast('Item updated successfully!');
      setTimeout(() => { window.location.href = '/inventory'; }, 1000);

    } catch (error) {
      this._saving = false;
      console.error('Fehler beim Speichern des Gegenstands:', error);
      getToastService().showToast('Server error: Could not save item.', 'error');
    }
  }

  _goBack(e) {
    if (e) e.preventDefault();

    if (this._hasUnsavedChanges()) {
      this._showUnsavedModal = true;
    } else {
      this._navigateToTarget();
    }
  }

  _clearFormAndLeave() {
    this._rawItem = null;
    this._showUnsavedModal = false;
    this._navigateToTarget();
  }

  _navigateToTarget() {
    const targetUrl = window.history.state && window.history.state.backUrl
      ? window.history.state.backUrl
      : "/inventory"; 

    window.history.pushState({}, "", targetUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  async _handleRecreate() {
    this._saving = true;
    this._showRecreateModal = false;
    
    const newItem = {
      name: this._name,
      description: this._description,
      location: this._rawItem?.location || null,
      categories: this._selectedCategories.map(c => c.id || c.name),
      image: this._imagePreview,
      favorite: this._rawItem?.favorite || false, 
      locationHistory: this._rawItem?.locationHistory || [] 
    };

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      if (!response.ok) throw new Error("Could not recreate item");
      
      this._rawItem = newItem;

      getToastService().showToast('Item recreated successfully!', 'success');
      setTimeout(() => { window.location.href = '/inventory'; }, 1000);
    } catch (err) {
      this._saving = false;
      getToastService().showToast('Error recreating item.', 'error');
    }
  }

  render() {
    const filteredCategories = this._categories.filter(cat => cat.name.toLowerCase().includes(this._categorySearch.toLowerCase()));

    return html`
      <div class="header">
        <span @click="${this._goBack}" class="back-button">&#x2039;</span>
        <h2>Edit Item</h2>
      </div>

      <div class="container mt-4">
        <div class="card shadow-sm mx-auto" style="max-width: 600px;">
          <div class="card-body p-4">
            
            <div class="mb-4 text-center">
              <input type="file" id="imageInput" hidden @change=${(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => { this._imagePreview = event.target.result; };
                  reader.readAsDataURL(file);
                }
              }} accept="image/*">
              <div class="upload-area" @click=${() => this.renderRoot.querySelector('#imageInput').click()}>
                ${this._imagePreview ? html`<img src="${this._imagePreview}" class="preview-img">` : html`<div class="text-muted">Upload Image</div>`}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Name <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="nameInput" .value=${this._name} @input=${e => this._name = e.target.value}>
            </div>

            <div class="mb-3">
              <label class="form-label">Description <span class="optional-label">(optional)</span></label>
              <textarea class="form-control" rows="2" .value=${this._description} @input=${e => this._description = e.target.value}></textarea>
            </div>

            <div class="mb-4 dropdown-wrapper">
              <label class="form-label">Categories <span class="optional-label">(optional)</span></label>
              <button type="button" class="form-control text-start d-flex justify-content-between align-items-center"
                      @click=${(e) => { e.stopPropagation(); this._showCategoryDropdown = !this._showCategoryDropdown; }}>
                <div class="text-truncate grow">
                  ${this._selectedCategories.length > 0 
                    ? this._selectedCategories.map(c => html`<span class="cat-badge">${c.name}</span>`) 
                    : html`<span class="text-muted">Select categories...</span>`
                  }
                </div>
                <span>▼</span>
              </button>
              ${this._showCategoryDropdown ? html`
                <div class="floating-dropdown p-2" @click=${e => e.stopPropagation()}>
                  <input type="text" class="form-control form-control-sm mb-2" placeholder="Search..." .value=${this._categorySearch} @input=${e => this._categorySearch = e.target.value}>
                  <div class="list-group list-group-flush mb-2" style="max-height: 150px; overflow-y: auto;">
                    ${filteredCategories.map(cat => {
                      const isSelected = this._selectedCategories.some(c => (c.id || c.name) === (cat.id || cat.name));
                      return html`
                        <button type="button" class="list-group-item list-group-item-action py-1 px-2 d-flex justify-content-between align-items-center" @click=${() => this._toggleCategory(cat)}>
                          <span class="text-truncate">${cat.name}</span>
                          ${isSelected ? html`<span class="text-success">✓</span>` : ''}
                        </button>
                      `;
                    })}
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-secondary w-100" @click=${() => window.location.href = '/create-category'}>+ Create Category</button>
                </div>
              ` : ''}
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-secondary flex-grow-1" .disabled=${this._saving} @click=${() => this._saveItem(false)}>                
                ${this._saving ? 'Saving...' : 'Save'}
              </button>
              <button class="btn btn-outline-secondary" type="button" .disabled=${this._saving} @click="${this._goBack}">
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
            <p class="text-muted">An item with this name already exists. Do you still want to save your changes?</p>
            <div class="d-flex justify-content-center gap-2 mt-4">
              <button class="btn btn-warning text-white flex-grow-1" @click=${() => { this._showDuplicateModal = false; this._saveItem(true); }}>
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
        <div class="modal-overlay" @click=${() => this._showRecreateModal = false}>
          <div class="modal-content" @click=${e => e.stopPropagation()}>
            <h5 class="mb-3">Item Deleted</h5>
            <p class="text-muted">This item has been deleted in another tab or by another user. Would you like to recreate it now with your edits?</p>
            <div class="d-flex justify-content-center gap-2 mt-4">
              <button class="btn btn-success flex-grow-1" @click=${() => this._handleRecreate()}>
                Create
              </button>
              <button class="btn btn-outline-secondary" @click=${() => { this._showRecreateModal = false; this._goBack(); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ` : ''}

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
customElements.define('edit-item-view', EditItemView);