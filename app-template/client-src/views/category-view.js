import { html, css } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";
import "../components/category-card.js";
import { getToastService } from '../services/toast-service.js';

export class CategoryView extends BSLitElement {
  static styles = [
    ...BSLitElement.styles,
    css`
      :host {
        display: block;
        position: relative;
        z-index: 1;
        padding: 0;
        margin: 0;
      }

      /* Wenn das Menü offen ist, kommt die Karte leicht nach vorne */
      :host([menu-open]) {
        z-index: 100;
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
    `,
  ];

  static properties = {
    categories: { type: Array },
    items: { type: Array },
    _selectedCategory: { type: Object, state: true},
    _showRemoveCatFromItems: { state: true },
    _showDeleteModal: { state: true }
  };

  constructor() {
    super();
    this.categories = [];
    this.items = [];
    this._showRemoveCatFromItems = false;
    this._showDeleteModal = false; 
    this._selectedCategory = null;
  }

  render() {
    return html`
    <div id="categories" class="container mt-2 border rounded p-3">
      <div class="d-flex align-items-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-card-list me-2" viewBox="0 0 16 16">
          <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
          <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z"/>
        </svg>
        <p class="m-0 fs-4"> Categories</p>
      </div>
<div class="container border rounded p-1">
      ${this.categories
        .sort((item1, item2) => item1.name.toLowerCase().localeCompare(item2.name.toLowerCase()))
        .map(
          (category) => html`
            <category-card
              .category=${category}
              @category-selected=${this._onSelect}
              @edit-category=${this._onEdit}
              @delete-category=${this._onDelete}
            ></category-card>
          `
        )}
      </div>

      ${this._showDeleteModal && this._selectedCategory
        ? html`
            <div class="modal-overlay" @click="${this._closeModal}">
              <div class="modal-content" @click="${(e) => e.stopPropagation()}">
                <h5 class="mb-3 text-danger">Delete Category?</h5>
                <p class="text-muted">
                  Are you sure you want to permanently delete <strong>${this._selectedCategory.name}</strong>?
                </p>
                <div class="d-flex justify-content-center gap-2 mt-4">
                  <button class="btn btn-danger flex-grow-1" @click="${this._confirmSimpleDelete}">
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

      ${this._showRemoveCatFromItems
        ? html`
            <div class="modal-overlay" @click="${this._closeModal}">
              <div class="modal-content" style="max-width: 500px;" @click="${(e) => e.stopPropagation()}">
                <h5 class="mb-3 text-warning">Category in Use</h5>
                <p class="text-muted">
                  The category <strong>${this._selectedCategory?.name}</strong> is currently assigned to 
                  <strong>${this.items.filter(i => i.categories?.includes(this._selectedCategory?.id)).length}</strong> item(s).
                </p>
                <p class="small text-secondary">
                  Clicking below will clear this category from those items and then permanently delete it.
                </p>
                
                <div class="d-flex justify-content-center gap-2 mt-4">
                  <button class="btn btn-warning text-white flex-grow-1" @click="${this._processRemovement}">
                    Remove & Delete
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

  connectedCallback() {
    super.connectedCallback();
    this._loadCategories();
  }

  firstUpdated() {
    this._getItems();
  }

  _loadCategories() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/categories');

    xhr.addEventListener('load', () => {
      try {
        this.categories = JSON.parse(xhr.responseText);
      } catch (err) {
        console.error(err);
      }
    });
    xhr.send();
  }

  _onSelect(e) {
    console.log("Selected:", e.detail.category);
  }

  _onEdit(e) {
    const id = e.detail.category.id;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/categories/${id}`);

    xhr.addEventListener('load', () => {
      if (xhr.status === 404) {
        getToastService().showToast('Category no longer exists.', 'error');
        this._loadCategories();
        return;
      }
      window.history.pushState({status: 'edit'}, "", `/category/${id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    xhr.send();
  }

  _onDelete(e) {
    this._selectedCategory = e.detail.category;
    this._checkUsageAndDelete();
  }

  _checkUsageAndDelete() {
    let itemsContainingCategory = this.items.filter(i => (i.categories || []).includes(this._selectedCategory.id));
    console.log(`items with category`, this._selectedCategory, ':', itemsContainingCategory);

    if (itemsContainingCategory.length > 0) {
      this._showRemoveCatFromItems = true;
    } else {
      this._showDeleteModal = true;
    }
  }

  _closeModal() {
    this._showRemoveCatFromItems = false;
    this._showDeleteModal = false;
    this._selectedCategory = null;
  }

  _confirmSimpleDelete() {
    this._deleteCategory();
    this._closeModal();
  }

  async _processRemovement() {
    const itemsContainingCategory = this.items.filter(item => 
      item.categories && item.categories.includes(this._selectedCategory.id)
    );

    const updatePromises = itemsContainingCategory.map((item) => {
      return new Promise((resolve, reject) => {
        const updatedCategories = item.categories.filter(catId => catId !== this._selectedCategory.id);

        const xhr = new XMLHttpRequest();
        xhr.open("PUT", `/api/items/${item.id}`);
        xhr.setRequestHeader("Content-Type", "application/json");
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            item.categories = updatedCategories;
            resolve();
          } else {
            reject();
          }
        };
        xhr.onerror = () => reject();

        xhr.send(JSON.stringify({
          ...item,
          categories: updatedCategories
        }));
      });
    });

    try {
      await Promise.all(updatePromises);
      
      this._closeModal();
      this._deleteCategory();
      
      getToastService().showToast('Category removed from all items.');
    } catch (err) {
      console.error("Error removing category from some items:", err);
      getToastService().showToast('Could not update all items.', 'error');
    }
  }

  _getItems() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/items');
    xhr.addEventListener('load', () => {
      try {
        this.items = JSON.parse(xhr.responseText);
      } catch (err) {
        console.error(err);
      }
    });
    xhr.send();
  }

  _deleteCategory() {
    const xhr = new XMLHttpRequest();
    const id = this._selectedCategory.id;
    xhr.open("DELETE", `/api/categories/${id}`);

    xhr.addEventListener("load", () => {
      try {
        if (xhr.status === 404) {
          getToastService().showToast('Category no longer exists.', 'error');
          this._loadCategories();
          return;
        }

        getToastService().showToast("Category deleted successfully.");
        this.categories = this.categories.filter((i) => i.id != id);
      } catch (err) {
        console.error(err);
      }
    });
    xhr.send();
  }
}

customElements.define("category-view", CategoryView);