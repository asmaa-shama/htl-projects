import { html } from 'lit';
import '../components/item-card.js';
import { BSLitElement } from '../base/bs-lit-element.js';
import { getToastService } from '../services/toast-service.js';

export class InventoryView extends BSLitElement {
  static properties = {
    items: {type: Object}
  }

  constructor() {
    super();
    this.items = [];
  }

  _getItems() {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', '/api/items');

    xhr.addEventListener('load', () => {
      try {
        const itemsFromBackend = JSON.parse(xhr.responseText);
        this.items = itemsFromBackend;
      } catch (err) {
        console.error(err);
      }
    });

    xhr.send();
  }

  firstUpdated() {
    this._getItems();
  }

  render() {
    return html`
    <div id="inventory" class="container mt-2 border rounded p-3">
      <div class="d-flex align-items-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-card-list me-2" viewBox="0 0 16 16">
          <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z"/>
          <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8m0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
        </svg>
        <p class="m-0 fs-4">Inventory</p>
      </div>

      <div id="inventoryList" class="container border rounded p-1">
        <item-list .items="${this.items.sort((item1, item2) => {
          const isFav1 = !!item1.favorite;
          const isFav2 = !!item2.favorite;
          if (isFav1 === isFav2) {
            const name1 = item1.name ? item1.name.toLowerCase() : '';
            const name2 = item2.name ? item2.name.toLowerCase() : '';
            return name1.localeCompare(name2);
          }
          return isFav1 ? -1 : 1;
        })}"></item-list>
      </div>
    </div>      
    `;
  }
}

customElements.define('inventory-view', InventoryView);