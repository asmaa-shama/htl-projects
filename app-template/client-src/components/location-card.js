import { html, css } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";

export class LocationCard extends BSLitElement {
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

      :host([close-all-menus]) {
        z-index: 100;
      }

      .card {
        border-radius: 15px;
        background: white;
        cursor: pointer;
        border: 1px solid #dee2e6;
        position: relative;
        transition: transform 0.2s;
      }

      .card-img-top {
        height: 110px;
        width: 100%;
        object-fit: cover;
        background-color: #f8f9fa;
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
        display: block;
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
        color: #212529;
      }

      .dots-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #6c757d;
        cursor: pointer;
        padding: 0 5px;
        line-height: 1;
      }

      .dropdown-menu {
        display: none;
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 1001;
        background: white !important;
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
        color: #212529;
      }

      .dropdown-item:hover {
        background: #f8f9fa;
      }

      .text-danger {
        color: #dc3545 !important;
        font-weight: 600;
      }
    `,
  ];

  static properties = {
    location: { type: Object },
    _menuOpen: { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.location = {};
    this._menuOpen = false;

    this._globalClose = (e) => {
      if (this._menuOpen && e.target !== this) {
        this._closeMenu();
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("click", this._globalClose);
    window.addEventListener("close-all-menus", this._globalClose);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("click", this._globalClose);
    window.removeEventListener("close-all-menus", this._globalClose);
  }

  render() {
    return html`
      <div class="card" @click="${this._handleCardClick}">
        <img
          src="/images/${this.location.pic_path==null? 'placeholder-Image.png': this.location.pic_path }"
          class="card-img-top"
          alt="${this.location.name}"
        />

        <div class="card-body">
          <h5 class="card-title">${this.location.name}</h5>

          <div class="dropdown">
            <button class="dots-button" @click="${this._toggleMenu}">⋮</button>
            <div class="dropdown-menu ${this._menuOpen ? "show" : ""}">
              <button class="dropdown-item" @click="${this._editLocation}">
                Edit
              </button>
              <button
                class="dropdown-item text-danger"
                @click="${this._requestDelete}"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
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

  _requestDelete(e) {
    e.stopPropagation();
    this._closeMenu();

    this.dispatchEvent(
      new CustomEvent("request-delete", {
        detail: { location: this.location },
        bubbles: true,
        composed: true,
      })
    );
  }

  _editLocation(e) {
    e.stopPropagation();
    this._closeMenu();
    console.log("Editing location:", this.location.id);
    
    this.dispatchEvent(
      new CustomEvent("edit-location", {
        detail: { location: this.location },
        bubbles: true,
        composed: true,
      })
    );
  }

  _handleCardClick() {
    if (this._menuOpen) {
      this._closeMenu();
      return;
    }
    const event = new CustomEvent("location-selected", {
      detail: { location: this.location },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define("location-card", LocationCard);