import { html, css } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";

export class SearchingContainer extends BSLitElement {
  static properties = {
    item: { type: Object },
    _menuOpen: { type: Boolean, state: true },
  };

   static styles = [
    ...BSLitElement.styles,
    css`
      :host {
        display: block;
        position: relative;
        z-index: 1;
      }

      :host([menu-open]) {
        z-index: 100;
      }

      .card {
        border-radius: 15px;
        background: white;
        border: 1px solid #dee2e6;
        cursor: pointer;
      }

      .card-body {
        padding: 0.6rem 0.8rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .card-title {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        max-width: 75%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dots-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #6c757d;
        cursor: pointer;
      }

      .dropdown-menu {
        display: none;
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 1001;
        background: white;
        border: 1px solid #ddd;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 140px;
        padding: 0.5rem 0;
      }

      .dropdown-menu.show {
        display: block;
      }

      .dropdown-item {
        display: block;
        width: 100%;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        border: none;
        background: none;
        text-align: left;
      }

      .dropdown-item:hover {
        background: #f8f9fa;
      }

      .text-danger {
        color: #dc3545;
        font-weight: 600;
      }
    `,
  ];


  constructor() {
    super();
    this.item = null;
    this._menuOpen = false;

    this._globalClose = (e) => {
      if (this._menuOpen && !this.contains(e.target)) {
        this._closeMenu();
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("click", this._globalClose);
    window.addEventListener("menu-opened", this._globalClose);
  }

  disconnectedCallback() {
    window.removeEventListener("click", this._globalClose);
    window.removeEventListener("menu-opened", this._globalClose);
    super.disconnectedCallback();
  }

  _toggleMenu(e) {
    e.stopPropagation();

    if (!this._menuOpen) {
      window.dispatchEvent(new CustomEvent("menu-opened"));
      this._menuOpen = true;
      this.setAttribute("menu-open", "");
    } else {
      this._closeMenu();
    }
  }

  _closeMenu() {
    this._menuOpen = false;
    this.removeAttribute("menu-open");
  }

  _editItem(e) {
    e.stopPropagation();
    this._closeMenu();

    this.dispatchEvent(
      new CustomEvent("edit-item", {
        detail: { item: this.item },
        bubbles: true,
        composed: true,
      })
    );
  }

  _deleteItem(e) {
    e.stopPropagation();
    this._closeMenu();

    this.dispatchEvent(
      new CustomEvent("delete-item", {
        detail: { item: this.item },
        bubbles: true,
        composed: true,
      })
    );
  }

  _selectItem() {
    if (this._menuOpen) return;

    this.dispatchEvent(
      new CustomEvent("item-selected", {
        detail: { item: this.item },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.item) return html``;

    return html`
      <div class="card rounded" @click="${this._selectItem}">
        <div class="card-body">
          <h5 class="card-title" title="${this.item.name}">
            ${this.item.name}
          </h5>

          <div class="dropdown">
            <button class="dots-button" @click="${this._toggleMenu}">
              ⋮
            </button>

            <div class="dropdown-menu ${this._menuOpen ? "show" : ""}">
              <button class="dropdown-item" @click="${this._editItem}">
                Edit
              </button>

              <button
                class="dropdown-item text-danger"
                @click="${this._deleteItem}"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("searching-container", SearchingContainer);