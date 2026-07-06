import { html, css } from 'lit';
import { BSLitElement } from '../base/bs-lit-element.js';
import './item-card.js';

export class ItemList extends BSLitElement {

  static styles = [
    ...BSLitElement.styles,
    css`
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
    `]

  static properties = {
    items: { type: Array },
    _showReturnModal: { type: Boolean, state: true },
  _itemToReturn: { type: Object, state: true }
  };

  constructor() {
    super();
    this.items = [];
    this._showReturnModal = false;
  this._itemToReturn = null;
  }

  render() {
    if (!this.items || this.items.length === 0) {
      return html`<p class="text-muted fst-italic">No items found.</p>`;
    }

    return html`
      <div class="row row-cols-1 row-cols-md-2 g-3"
           @transfer-items="${this._handleTransferItem}" 
           @item-deleted="${this._handleItemDeleted}">
        
        ${this.items
          .map(item => html`
            <div class="col">
              <item-card .item=${item}></item-card>
            </div>
          `)}
      </div>
${this._showReturnModal && this._itemToReturn
  ? html`
      <div class="modal-overlay" @click="${this._closeReturnModal}">
        <div class="modal-content" @click="${(e) => e.stopPropagation()}">
          <h5 class="mb-3">Return Item?</h5>
          <p class="text-muted">
            This item is currently borrowed. Do you want to return <strong>${this._itemToReturn.name}</strong> now?
          </p>
          <div class="d-flex justify-content-center gap-2 mt-4">
            <button class="btn btn-success flex-grow-1" @click="${this._confirmReturn}">
              Return
            </button>
            <button class="btn btn-outline-secondary" @click="${this._closeReturnModal}">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `
  : ""}
    `;
  }

  _handleItemDeleted(e) {
    this.items = this.items.filter(item => item.id !== e.detail.itemId);
  }

_handleTransferItem(e) {
  const item = e.detail.item;
  
  if (!item.borrowed) {
    const currentPath = window.location.pathname; 
    window.history.pushState({ item: item, backUrl: currentPath }, "", `/transfer/${item.id}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  } else {
    this._itemToReturn = item;
    this._showReturnModal = true;
  }
}

_closeReturnModal() {
  this._showReturnModal = false;
  this._itemToReturn = null;
}

_confirmReturn() {
    window.history.pushState({}, '', `/return/${this._itemToReturn.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  this._closeReturnModal();
}
}

customElements.define('item-list', ItemList);