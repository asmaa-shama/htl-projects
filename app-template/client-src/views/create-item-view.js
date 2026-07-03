import { html, css } from 'lit';
import { BSLitElement } from '../base/bs-lit-element.js';
import { getToastService } from '../services/toast-service.js';

let categoriesData;

export class CreateItemView extends BSLitElement {
  static properties = {
    _name: { state: true },
    _description: { state: true },
    _selectedLocation: { state: true },
    _selectedCategories: { state: true },
    _imagePreview: { state: true },
    _locations: { state: true },
    _categories: { state: true },
    _locationSearch: { state: true },
    _categorySearch: { state: true },
    _showLocationDropdown: { state: true },
    _showCategoryDropdown: { state: true },
    _showDuplicateModal: { state: true },
    _showUnsavedModal: { state: true }
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
    `
  ];

  constructor() {
    super();
    this._name = '';
    this._description = '';
    this._selectedLocation = null;
    this._selectedCategories = [];
    this._imagePreview = null;
    this._locationSearch = '';
    this._categorySearch = '';
    this._showLocationDropdown = false;
    this._showCategoryDropdown = false;
    this._showDuplicateModal = false;
    this._showUnsavedModal = false;

    this._categories = categoriesData ? (Array.isArray(categoriesData) ? categoriesData : [categoriesData]) : [];
    this._locations = [
      { id: "loc-1", name: "Location 1" },
      { id: "loc-2", name: "Location 2" }
    ];

    this._closeDropdowns = () => {
      this._showLocationDropdown = false;
      this._showCategoryDropdown = false;
    };

    this._onBeforeUnload = this._onBeforeUnload.bind(this);
    this._restoreState();
  }

  _saveState() {
    const state = {
      name: this._name,
      description: this._description,
      selectedLocation: this._selectedLocation,
      selectedCategories: this._selectedCategories,
      imagePreview: this._imagePreview
    };
    try {
      sessionStorage.setItem('createItemState', JSON.stringify(state));
    } catch (err) {
      console.warn("Could not save state to sessionStorage. Image might be too large.", err);
      state.imagePreview = null;
      try {
        sessionStorage.setItem('createItemState', JSON.stringify(state));
      } catch (e) {
        console.error("Failed to save state entirely", e);
      }
    }
  }

  _restoreState() {
    const savedStateStr = sessionStorage.getItem('createItemState');
    if (savedStateStr) {
      try {
        const savedState = JSON.parse(savedStateStr);
        this._name = savedState.name || '';
        this._description = savedState.description || '';
        this._selectedLocation = savedState.selectedLocation || null;
        this._selectedCategories = savedState.selectedCategories || [];
        this._imagePreview = savedState.imagePreview || null;
        sessionStorage.removeItem('createItemState');
      } catch (err) {
        console.error("Failed to parse saved state", err);
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._closeDropdowns);
    window.addEventListener('beforeunload', this._onBeforeUnload);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._closeDropdowns);
    window.removeEventListener('beforeunload', this._onBeforeUnload);
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
      this._selectedLocation !== null ||
      this._selectedCategories.length > 0 ||
      this._imagePreview !== null
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
    this._selectedLocation = null;
    this._selectedCategories = [];
    this._imagePreview = null;
    this._showUnsavedModal = false;
    this._goBack();
  }

  _localeSort(array, key) {
    if (!Array.isArray(array)) return [];
    return [...array].sort((a, b) => {
      const valA = key ? a[key] : a;
      const valB = key ? b[key] : b;
      return String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base', numeric: true });
    });
  }

  firstUpdated() {
    this._fetchLocations();
    this._fetchCategories();
  }

  _fetchLocations() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/locations');
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          this._locations = Array.isArray(data) ? data : [data];

          const newLocName = sessionStorage.getItem('newlyCreatedLocationName');
          if (newLocName) {
            const newlyCreated = this._locations.find(l => l.name === newLocName);
            if (newlyCreated) {
              this._selectedLocation = newlyCreated;
              sessionStorage.removeItem('newlyCreatedLocationName');
            }
          }
        } catch (err) { console.error("Parse error locations", err); }
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
          this._categories = Array.isArray(data) ? data : [data];

          const newCatName = sessionStorage.getItem('newlyCreatedCategoryName');
          if (newCatName) {
            const newlyCreated = this._categories.find(c => c.name === newCatName);
            if (newlyCreated) {
              const isSelected = this._selectedCategories.some(c => (c.id || c.name) === (newlyCreated.id || newlyCreated.name));
              if (!isSelected) {
                this._selectedCategories = [...this._selectedCategories, newlyCreated];
              }
              sessionStorage.removeItem('newlyCreatedCategoryName');
            }
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
      this._selectedCategories = [...this._selectedCategories, cat];
    }
  }

  async _saveItem(force = false) {
    if (!this._name || !this._selectedLocation) {
      getToastService().showToast('Please fill in Name and Location.', 'error');
      return;
    }

    try {
      const locResponse = await fetch(`/api/locations/${this._selectedLocation.id}`);
      if (locResponse.status === 404) {
        getToastService().showToast('The selected location was deleted in another tab!', 'error');
        this._selectedLocation = null;
        this._fetchLocations();
        return;
      }
    } catch (err) {
      console.error("Error checking location:", err);
      return;
    }

    const newItem = {
      name: this._name,
      description: this._description,
      location: this._selectedLocation.id || this._selectedLocation.name,
      categories: this._selectedCategories.map(c => c.id || c.name),
      image: this._imagePreview,
      locationHistory: []
    };

    newItem.locationHistory.push({
      "locationName": this._selectedLocation.name,
      "date": new Date(),
      "id": this._selectedLocation.id
    });

    try {
      const url = force ? '/api/items?force=true' : '/api/items';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      });

      if (response.status === 409) {
        this._showDuplicateModal = true;
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      getToastService().showToast('Item created successfully!');
      
      this._name = '';
      this._description = '';
      this._selectedLocation = null;
      this._selectedCategories = [];
      this._imagePreview = null;

      setTimeout(() => { window.location.href = '/inventory'; }, 1000);

    } catch (error) {
      console.error('Fehler beim Speichern des Gegenstands:', error);
      getToastService().showToast('Server error: Could not save item.', 'error');
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
    const filteredLocations = this._locations.filter(loc => loc.name.toLowerCase().includes(this._locationSearch.toLowerCase()));
    const filteredCategories = this._categories.filter(cat => cat.name.toLowerCase().includes(this._categorySearch.toLowerCase()));

    const sortedLocations = this._localeSort(filteredLocations, 'name');
    const sortedCategories = this._localeSort(filteredCategories, 'name');
    const sortedSelectedCategories = this._localeSort(this._selectedCategories, 'name');

    return html`
      <div class="header">
        <span @click="${this._handleBackClick}" class="back-button">&#x2039;</span>
        <h2>Create New Item</h2>
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
              <input type="text" class="form-control" .value=${this._name} @input=${e => this._name = e.target.value}>
            </div>

            <div class="mb-3">
              <label class="form-label">Description <span class="optional-label">(optional)</span></label>
              <textarea class="form-control" rows="2" .value=${this._description} @input=${e => this._description = e.target.value}></textarea>
            </div>

            <div class="mb-3 dropdown-wrapper">
              <label class="form-label">Location <span class="text-danger">*</span></label>
              <button type="button" class="form-control text-start d-flex justify-content-between align-items-center" 
                      @click=${(e) => { e.stopPropagation(); this._showLocationDropdown = !this._showLocationDropdown; this._showCategoryDropdown = false; }}>
                <span class="${this._selectedLocation ? '' : 'text-muted'} text-truncate">
                  ${this._selectedLocation ? this._selectedLocation.name : 'Select a location...'}
                </span>
                <span>▼</span>
              </button>
              ${this._showLocationDropdown ? html`
                <div class="floating-dropdown p-2" @click=${e => e.stopPropagation()}>
                  <input type="text" class="form-control form-control-sm mb-2" placeholder="Search..." .value=${this._locationSearch} @input=${e => this._locationSearch = e.target.value}>
                  <div class="list-group list-group-flush mb-2" style="max-height: 150px; overflow-y: auto;">
                    ${sortedLocations.map(loc => html`
                      <button type="button" class="list-group-item list-group-item-action py-1 px-2 text-truncate flex-shrink-0 d-block" @click=${() => { this._selectedLocation = loc; this._showLocationDropdown = false; }}>
                        ${loc.name}
                      </button>
                    `)}
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-secondary w-100" @click=${() => {
                    this._saveState();
                    window.history.pushState({ backUrl: '/create-item' }, "", '/create-locations');
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }}>+ Create Location</button>
                </div>
              ` : ''}
            </div>

            <div class="mb-4 dropdown-wrapper">
              <label class="form-label">Categories <span class="optional-label">(optional)</span></label>
              <button type="button" class="form-control text-start d-flex justify-content-between align-items-center"
                      @click=${(e) => { e.stopPropagation(); this._showCategoryDropdown = !this._showCategoryDropdown; this._showLocationDropdown = false; }}>
                <div class="text-truncate grow">
                  ${sortedSelectedCategories.length > 0 ? sortedSelectedCategories.map(c => html`<span class="cat-badge">${c.name}</span>`) : html`<span class="text-muted">Select categories...</span>`}
                </div>
                <span>▼</span>
              </button>
              ${this._showCategoryDropdown ? html`
                <div class="floating-dropdown p-2" @click=${e => e.stopPropagation()}>
                  <input type="text" class="form-control form-control-sm mb-2" placeholder="Search..." .value=${this._categorySearch} @input=${e => this._categorySearch = e.target.value}>
                  <div class="list-group list-group-flush mb-2" style="max-height: 150px; overflow-y: auto;">
                    ${sortedCategories.map(cat => {
                      const isSelected = this._selectedCategories.some(c => (c.id || c.name) === (cat.id || cat.name));
                      return html`<button type="button" class="list-group-item list-group-item-action py-1 px-2 d-flex justify-content-between align-items-center" @click=${() => this._toggleCategory(cat)}>
                        <span class="text-truncate">${cat.name}</span>
                        ${isSelected ? html`<span class="text-success">✓</span>` : ''}
                      </button>`;
                    })}
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-secondary w-100" @click=${() => {
                    this._saveState();
                    window.history.pushState({ backUrl: '/create-item' }, "", '/create-category');
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }}>+ Create Category</button>
                </div>
              ` : ''}
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-secondary grow" @click=${() => this._saveItem(false)}>Create</button>
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
            <p class="text-muted">An item with this name already exists. Do you still want to create it?</p>
            <div class="d-flex justify-content-center gap-2 mt-4">
              <button class="btn btn-warning text-white flex-grow-1" @click=${() => { this._showDuplicateModal = false; this._saveItem(true); }}>
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
customElements.define('create-item-view', CreateItemView);