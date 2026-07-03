import { html, css } from 'lit';
import { BSLitElement } from '../base/bs-lit-element.js';
import { getToastService } from '../services/toast-service.js';

class ItemCard extends BSLitElement {
  static styles = [
    super.styles,
    css`
      :host {
        display: block;
        position: relative; 
      }
      .dropdown-menu {
        display: block; 
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;
        padding: 0.5rem 0;
        z-index: 1000;
        min-width: 150px;
      }
      .dropdown-item {
        display: block;
        width: 100%;
        padding: 0.5rem 1rem;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
      }
      .dropdown-item:hover {
        background-color: #f8f9fa;
      }
      .star-btn {
        transition: transform 0.1s ease-in-out;
      }
      .star-btn:active {
        transform: scale(0.85);
      }
      .modal-overlay {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5); z-index: 1060;
        display: flex; align-items: center; justify-content: center;
      }
      .modal-content {
        background: white; padding: 1.5rem; border-radius: 10px; 
        max-width: 400px; width: 90%; text-align: center;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      }
    `
  ];

  static properties = {
    item: { type: Object },
    location: { type: Object },
    _menuOpen: { state: true },
    _showDeleteModal: { state: true },
    _isTogglingFavorite: { state: true }
  };

  constructor() {
    super();
    this.item = null; 
    this._menuOpen = false;
    this.location = null;
    this._showDeleteModal = false;
    this._isTogglingFavorite = false;
  }

  miniMenu(e) {
    e.stopPropagation();
    
    if (!this._menuOpen) {
      this.dispatchEvent(
        new CustomEvent('close-all-menus', {
          bubbles: true,
          composed: true
        })
      );
    }
    this._menuOpen = !this._menuOpen;
  }
  
  _fetchLocationDetails(id) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/locations/${id}`);
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        try {
          this.location = JSON.parse(xhr.responseText);
        } catch (err) {
          console.error("Error parsing JSON:", err);
        }
      } else if (xhr.status === 404) {
        this.location = { name: "Unknown Location" };
      }
    });
    xhr.send();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('item') && this.item && this.item.location) {
      this._fetchLocationDetails(this.item.location);
    }
  }

  _viewDetails() {
    window.history.pushState({ item: this.item, backUrl: window.location.pathname }, "", `/item/${this.item.id}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  _edit(e) {
    e.stopPropagation();
    this._menuOpen = false;
    window.history.pushState({ item: this.item }, "", `/edit/${this.item.id}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  async _toggleFavorite(e) {
    e.stopPropagation();
    if (!this.item || this._isTogglingFavorite) return;

    this._isTogglingFavorite = true;
    const newFavoriteStatus = !this.item.favorite;

    try {
      const response = await fetch(`/api/items/${this.item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: newFavoriteStatus }),
      });

      if (response.status === 404) {
        getToastService().showToast('Item was deleted', 'error');
        this._notifyList();
        return;
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      this.item = { ...this.item, favorite: newFavoriteStatus };
    } catch (err) {
      console.error("Could not update favorite status:", err);
    } finally {
      this._isTogglingFavorite = false;
    }
  }

  async _executeDelete(e) {
    e.stopPropagation();
    this._showDeleteModal = false;
    
    try {
      const response = await fetch(`/api/items/${this.item.id}`, { method: 'DELETE' });

      if (response.status === 404) {
        getToastService().showToast('Item no longer exists.', 'error');
        this._notifyList(); 
        return;
      }

      if (!response.ok) throw new Error('Delete failed');

      getToastService().showToast('Item deleted successfully.');
      this._notifyList();
    } catch (err) {
      console.error(err);
      getToastService().showToast('Error deleting item.', 'error');
    }
  }

  _notifyList() {
    this.dispatchEvent(new CustomEvent('item-deleted', {
      detail: { itemId: this.item.id },
      bubbles: true,
      composed: true
    }));
  }

  _transfer(e) {
    e.stopPropagation();
    this._menuOpen = false;
    this.dispatchEvent(new CustomEvent("transfer-items", {
      detail: { item: this.item },
      bubbles: true,
      composed: true,
    }));
  }

  _lend(e) {
    e.stopPropagation();
    this._menuOpen = false;
    console.log("Lending Card ... ", this.item.name);

    window.history.pushState({}, '', `/borrow/${this.item.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  _returnItem(e) {
    e.stopPropagation();
    this._menuOpen = false;
    
    console.log("Navigating via location paths for item:", this.item.id);
    
    window.history.pushState({}, '', `/return/${this.item.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  
  render() {
    if (!this.item) return html``;

    return html`
        <div class="d-flex align-items-center border rounded p-3 bg-white shadow-sm" style="cursor: pointer;" @click=${this._viewDetails}>

            ${this.item.image 
                ? html`<img src="${this.item.image}" alt="${this.item.name}" width="45" height="45" class="rounded m-1" style="object-fit: cover;">` 
                : html`
                    <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" class="bi bi-image m-1 text-muted" viewBox="0 0 16 16">
                        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                        <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
                    </svg>
                `
            }

            <div class="m-0 flex-grow-1 ms-2">
                <strong>${this.item.name}</strong> — 
                ${this.item.borrowed 
                    ? html`<span class="text-danger">Lending to ${this.item.locationHistory?.[0]?.locationName || 'Unknown'}</span>`
                    : html`<span class="text-muted">${this.location?.name || 'Loading location...'}</span>`
                }
            </div>

            <div class="d-flex align-items-center gap-3 position-relative">
                <button type="button" class="btn btn-link p-0 star-btn" ?disabled=${this._isTogglingFavorite} @click=${this._toggleFavorite}>
                    ${this.item.favorite 
                        ? html`
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#ffc107" class="bi bi-star-fill" viewBox="0 0 16 16">
                                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                            </svg>
                        ` 
                        : html`
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-star text-muted" viewBox="0 0 16 16">
                                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.848 3.655a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
                            </svg>
                        `
                    }
                </button>

                <button type="button" class="btn btn-link text-dark p-0" @click=${this.miniMenu}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                    </svg>
                </button>

                ${this._menuOpen ? html`
                <div class="dropdown-menu show shadow" style="position: absolute; right: 0; top: 100%;">
                    <button class="dropdown-item" @click=${this._edit}>Edit</button>
                    <button class="dropdown-item text-danger" @click=${(e) => { e.stopPropagation(); this._menuOpen = false; this._showDeleteModal = true; }}>Delete</button>
                    ${this.item?.borrowed ? html`
                        <button class="dropdown-item text-success" @click=${(e) => this._returnItem(e)}>Return Item</button>
                    ` : html`
                        <button class="dropdown-item" @click=${(e) => this._lend(e)}>Lend</button>
                    `}
                    <button class="dropdown-item" @click=${this._transfer}>Transfer</button>
                </div>
                ` : ''}
            </div>

            ${this._showDeleteModal ? html`
                <div class="modal-overlay" @click=${(e) => { e.stopPropagation(); this._showDeleteModal = false; }}>
                    <div class="modal-content" @click=${(e) => e.stopPropagation()}>
                        <h5 class="mb-3">Delete Item?</h5>
                        <p class="text-muted">Are you sure you want to permanently delete <strong>${this.item.name}</strong>?</p>
                        <div class="d-flex justify-content-center gap-2 mt-4">
                            <button class="btn btn-danger" @click=${this._executeDelete}>Delete</button>
                            <button class="btn btn-outline-secondary" @click=${() => this._showDeleteModal = false}>Cancel</button>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._closeHandler = () => { this._menuOpen = false; };
    document.addEventListener('click', this._closeHandler);

    this._closeAllHandler = () => { if (this._menuOpen) this._menuOpen = false; };
    window.addEventListener('close-all-menus', this._closeAllHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._closeHandler);
    window.removeEventListener('close-all-menus', this._closeAllHandler);
  }
}

customElements.define('item-card', ItemCard);