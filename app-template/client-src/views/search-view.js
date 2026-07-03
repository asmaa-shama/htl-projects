import { html, css } from 'lit';
import { BSLitElement } from '../base/bs-lit-element.js';
import '../components/searching-container.js';
import '../components/item-list.js';

export class SearchView extends BSLitElement {
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
          max-height: 250px;
          overflow-y: auto;
          padding-right: 5px;
          border: 1px solid #e9ecef;
          border-radius: 5px;
          background: #f8f9fa;
        }
      `,
  ];

  static properties = {
    _testItems: { state: true },
    _filteredTestItems: { state: true },
    _suggestions: { state: true },
    _showSuggestions: { state: true },
    _inputValue: { state: true },
    _showFilterModal: { state: true },
    _sortBy: { state: true }
  };

  constructor() {
    super();
    this._testItems = [];
    this._filteredTestItems = [];
    this._suggestions = [];
    this._showSuggestions = false;
    this.locations = [];
    this.categories = [];
    this._inputValue = '';
    this._catFilterBy = '';
    this._locFilterBy = '';
    this._lendFilterBy = '';
    this._sortBy = 'A-Z';
    this._showFilterModal = false;
  }

  connectedCallback() {
    super.connectedCallback();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('borrowed') === 'true') {
      this._lendFilterBy = 'true';
    }
    this._loadItemsFromServer();
  }

  async _loadItemsFromServer() {
    try {
      const response = await fetch('/api/items');
      if (response.ok) {
        const items = await response.json();
        this._testItems = items;
        this._applyAllFiltersAndSort();
      } else {
        console.error("Fehler beim Laden der Items:", response.status);
      }
    } catch (err) {
      console.error("Netzwerkfehler beim Laden der Items:", err);
    }
  }

  render() {
    if (!this._testItems || this._testItems.length === 0) {
      return html`<h2>Search</h2><p class="text-muted">Loading items...</p>`;
    }

    return html`
      <h2>Search</h2>

      <div class="input-group input-group-sm mb-2">
        <div class="input-group-text" id="inputGroup-sizing-sm" @click="${() => this._applyAllFiltersAndSort()}" style="cursor: pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
          </svg>
        </div>
        <input type="text" 
          id="search-input"
          placeholder="Search"
          class="form-control" 
          .value="${this._inputValue}"
          @input="${(e) => this._renderSuggestions(e.target)}"
          @blur="${() => setTimeout(() => this._showSuggestions = false, 200)}"
          @keydown="${(e) => e.key === 'Enter' && this._applyAllFiltersAndSort()}"
          aria-describedby="inputGroup-sizing-sm">
          
          ${this._showSuggestions && this._suggestions.length > 0 ? html`
            <ul class="dropdown-menu show w-100" style="position: absolute; top: 100%; z-index: 1050;">
              ${this._suggestions.map(item => html`
                <li>
                  <a class="dropdown-item" href="#" @click="${(e) => { e.preventDefault(); this._selectItem(item); }}">
                    ${item.name}
                  </a>
                </li>
              `)}
            </ul>
          ` : ''}
      </div>
      
      <div class="filter-bar d-flex align-items-center justify-content-end gap-2 mb-3 pb-2 border-bottom">
        <button class="btn btn-link btn-sm text-secondary" @click="${this._resetFilters}">Reset</button>

        <select class="form-select form-select-sm" style="width: auto;" @change="${this._handleSortChange}">
          <option value="A-Z" ?selected="${this._sortBy === 'A-Z'}">Sort: A-Z (Asc)</option>
          <option value="Z-A" ?selected="${this._sortBy === 'Z-A'}">Sort: Z-A (Desc)</option>
        </select>

        <button class="btn btn-light btn-sm" title="Filtern" @click="${this._openFilterModal}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z"/>
          </svg>
        </button>
      </div>

      <div id="inventoryList" class="container border rounded p-1" style="margin-top:10px">
        <item-list .items=${this._filteredTestItems}></item-list>
      </div>

      ${this._showFilterModal
        ? html`
              <div class="modal-overlay" @click="${this._closeModal}">
                <div class="modal-content" style="max-width: 500px;" @click="${(e) => e.stopPropagation()}">
                  <h5 class="modal-title">Filter Options</h5>
                  <div class="item-scroll-container text-start mb-4 p-2">
                    
                    <div class="mb-2 p-2 border rounded bg-white shadow-sm">
                      <div class="small fw-bold text-truncate text-dark">CATEGORIES</div>
                      <select class="form-select form-select-sm mt-1 category-filter-select">
                        <option value="">All Categories</option>
                        ${this.categories.map((cat) => html`
                          <option value="${cat.id}" ?selected="${this._catFilterBy == cat.id}">${cat.name}</option>
                        `)}
                      </select>
                    </div>

                    <div class="mb-2 p-2 border rounded bg-white shadow-sm">
                      <div class="small fw-bold text-truncate text-dark">LOCATIONS</div>
                      <select class="form-select form-select-sm mt-1 location-filter-select">
                        <option value="">All Locations</option>
                        ${this.locations.map((loc) => html`
                          <option value="${loc.id}" ?selected="${this._locFilterBy == loc.id}">${loc.name}</option>
                        `)}
                      </select>
                    </div>

                    <div class="mb-2 p-2 border rounded bg-white shadow-sm">
                      <div class="small fw-bold text-truncate text-dark">LEND STATUS</div>
                      <select class="form-select form-select-sm mt-1 lend-filter-select">
                        <option value="" ?selected="${this._lendFilterBy === ''}">All Items</option>
                        <option value="true" ?selected="${this._lendFilterBy === 'true'}">Currently Lent</option>
                        <option value="false" ?selected="${this._lendFilterBy === 'false'}">Available (Not Lent)</option>
                      </select>
                    </div>

                  </div>
                  <div class="d-flex justify-content-center gap-2 mt-4">
                    <button class="btn btn-warning text-white flex-grow-1" @click="${this._saveFilters}">
                      Save Filters
                    </button>
                    <button class="btn btn-outline-secondary" @click="${this._closeModal}">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            `
        : ""}
    `;
  }

  _renderSuggestions(target) {
    this._inputValue = target.value;
    const searchLower = this._inputValue.toLowerCase();

    if (searchLower.length > 0) {
      this._suggestions = this._testItems
        .filter(i => i.name && i.name.toLowerCase().includes(searchLower))
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      this._showSuggestions = true;
    } else {
      this._showSuggestions = false;
    }
  }

  _handleSortChange(e) {
    this._sortBy = e.target.value;
    this._applyAllFiltersAndSort();
  }

  _loadLocations() {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/locations");
      xhr.addEventListener("load", () => {
        try {
          this.locations = JSON.parse(xhr.responseText);
        } catch (err) {
          console.error("Error parsing locations:", err);
        }
        resolve();
      });
      xhr.send();
    });
  }

  _loadCategories() {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/categories');
      xhr.addEventListener('load', () => {
        try {
          this.categories = JSON.parse(xhr.responseText);
        } catch (err) {
          console.error("Error parsing categories:", err);
        }
        resolve();
      });
      xhr.send();
    });
  }

  _selectItem(item) {
    this._inputValue = item.name;
    this._showSuggestions = false;
    this._applyAllFiltersAndSort();
  }

  _resetFilters() {
    this._inputValue = '';
    this._catFilterBy = '';
    this._locFilterBy = '';
    this._lendFilterBy = '';
    this._applyAllFiltersAndSort();
  }

  async _openFilterModal() {
    await this._loadLocations();
    await this._loadCategories();
    this._showFilterModal = true;
  }

  _closeModal() {
    this._showFilterModal = false;
  }

  _saveFilters() {
    if (this._showFilterModal) {
      this._catFilterBy = this.renderRoot.querySelector(".category-filter-select")?.value || "";
      this._locFilterBy = this.renderRoot.querySelector(".location-filter-select")?.value || "";
      this._lendFilterBy = this.renderRoot.querySelector(".lend-filter-select")?.value || "";
    }
    this._applyAllFiltersAndSort();
    this._closeModal();
  }

  _applyAllFiltersAndSort() {
    let results = [...this._testItems];

    if (this._inputValue && this._inputValue.trim() !== "") {
      const searchLower = this._inputValue.toLowerCase();
      results = results.filter(i => i.name && i.name.toLowerCase().includes(searchLower));
    }

    if (this._locFilterBy !== "") {
      results = results.filter(i => i.locationId == this._locFilterBy || i.location == this._locFilterBy);
    }

    if (this._catFilterBy !== "") {
      results = results.filter(i => i.categories && i.categories.includes(this._catFilterBy));
    }

    if (this._lendFilterBy !== "") {
      const targetLentState = this._lendFilterBy === "true";
      results = results.filter(i => {
        const isCurrentlyLent = !!(i.borrowed); 
        return isCurrentlyLent === targetLentState;
      });
    }

    results.sort((item1, item2) => {
      const name1 = item1.name ? item1.name.toLowerCase() : '';
      const name2 = item2.name ? item2.name.toLowerCase() : '';
      
      if (this._sortBy === 'A-Z') {
        return name1.localeCompare(name2);
      } else {
        return name2.localeCompare(name1);
      }
    });

    this._filteredTestItems = results;
  }
}

customElements.define('search-view', SearchView);

