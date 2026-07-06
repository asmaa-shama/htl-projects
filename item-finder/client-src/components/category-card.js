import { html, css } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";

export class CategoryCard extends BSLitElement {
  static properties = {
    category: { type: Object },
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

      :host([close-all-menus]) {
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
    this.category = null;
    this._menuOpen = false;

    this._handleOutsideClick = (e) => {
      if (this._menuOpen && !this.contains(e.target)) {
        this._closeMenu();
      }
    };

    this._handleOtherMenuOpen = () => {
      if (this._menuOpen) {
        this._closeMenu();
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("click", this._handleOutsideClick);
    window.addEventListener("close-all-menus", this._handleOtherMenuOpen);
  }

  disconnectedCallback() {
    window.removeEventListener("click", this._handleOutsideClick);
    window.removeEventListener("close-all-menus", this._handleOtherMenuOpen);
    super.disconnectedCallback();
  }

  _toggleMenu(e) {
    e.stopPropagation();

    if (!this._menuOpen) {
      window.dispatchEvent(new CustomEvent("close-all-menus"));
      this._menuOpen = true;
      this.setAttribute("close-all-menus", "");
    } else {
      this._closeMenu();
    }
  }

  _closeMenu() {
    this._menuOpen = false;
    this.removeAttribute("close-all-menus");
  }

  _editCategory(e) {
    e.stopPropagation();
    this._closeMenu();

    this.dispatchEvent(
      new CustomEvent("edit-category", {
        detail: { category: this.category },
        bubbles: true,
        composed: true,
      })
    );
  }

  _deleteCategory(e) {
    e.stopPropagation();
    this._closeMenu();

    this.dispatchEvent(
      new CustomEvent("delete-category", {
        detail: { category: this.category },
        bubbles: true,
        composed: true,
      })
    );
  }

  _selectCategory() {
    if (this._menuOpen) return;

    this.dispatchEvent(
      new CustomEvent("category-selected", {
        detail: { category: this.category },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.category) return html``;

    return html`
      <div class="card" @click="${this._selectCategory}">
        <div class="card-body">
          <h5 class="card-title" title="${this.category.name}">
            ${this.category.name}
          </h5>

          <div class="dropdown">
            <button class="dots-button" @click="${this._toggleMenu}">
              ⋮
            </button>

            <div class="dropdown-menu ${this._menuOpen ? "show" : ""}">
              <button class="dropdown-item" @click="${this._editCategory}">
                Edit
              </button>

              <button
                class="dropdown-item text-danger"
                @click="${this._deleteCategory}"
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

customElements.define("category-card", CategoryCard);