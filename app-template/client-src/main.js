import './views/inventory-view.js';
import './styles/styles.css';
import { html, css } from 'lit';
import { Router } from '@lit-labs/router';
import { BSLitElement } from './base/bs-lit-element.js';
import './components/toast-container.js';
import './components/searching-container.js';
import './views/home-view.js';
import './views/category-view.js';
import './views/borrow-view.js';
import './views/return-view.js';
import './views/item-details-view.js'; 
import './views/create-item-view.js';
import './views/edit-item-view.js';
import './views/settings-view.js';
import './views/locations-view.js';
import './components/location-details.js';
import './views/search-view.js';
import './views/transfer-item.js';
import './views/create-location-view.js'
import './views/create-category-view.js';
import './views/edit-category-view.js';
import { createToastService } from './services/toast-service.js';

class AppRoot extends BSLitElement {

  static styles = [
    super.styles,
    css`
      :host {
        display: block;
        height: 100vh;
      }

      .app-layout {
        display: flex;
        height: 100%;
      }

      .sidebar {
        width: 240px;
        min-width: 240px;
        background-color: var(--app-theme-color, #212529);
        color: #fff;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s ease;
      }

      .sidebar-header {
        padding: 1.25rem 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }

      .sidebar-header h5 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #fff;
      }

      .sidebar-nav {
        flex: 1;
        padding: 0.5rem 0;
        overflow-y: auto;
      }

      .sidebar-nav a {
        display: block;
        padding: 0.6rem 1rem;
        color: rgba(255,255,255,0.7);
        text-decoration: none;
        font-size: 0.9rem;
        transition: background-color 0.15s, color 0.15s;
      }

      .sidebar-nav a:hover {
        background-color: rgba(255,255,255,0.1);
        color: #fff;
      }

      .main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .topbar {
        display: none;
        padding: 0.75rem 1rem;
        background-color: color-mix(in srgb, var(--app-theme-color, red) 40%, white);
        border-bottom: 1px solid #dee2e6;
      }

      .menu-btn {
        background: none;
        border: 1px solid color-mix(in srgb, var(--app-theme-color, red) 60%, white);
        border-radius: 4px;
        padding: 0.3rem 0.6rem;
        font-size: 1.2rem;
        cursor: pointer;
        line-height: 1;
      }
      
      .search-btn {
        margin-left: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.3rem 0.6rem;
        border: 1px solid color-mix(in srgb, var(--app-theme-color, red) 60%, white);
        border-radius: 4px;
        color: #212529;
        text-decoration: none;
        background: none;
        cursor: pointer;
      }

      .search-btn:hover {
        background-color: #e9ecef;
      }

      .content {
        flex: 1;
        padding: 1.5rem;
        overflow-y: auto;
      }

      .overlay {
        display: none;
        position: fixed;
        inset: 0;
        background-color: rgba(0,0,0,0.4);
        z-index: 999;
      }

      @media (max-width: 767px) {
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 1000;
          transform: translateX(-100%);
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .overlay.open {
          display: block;
        }

        .topbar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
      }
      .main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        padding-bottom: 60px; 
      }

      .bottom-bar {
        display: none;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background-color: var(--app-theme-color, #212529);
        justify-content: space-around;
        align-items: center;
        z-index: 998;
      }

      .bottom-bar a {
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        font-size: 0.8rem;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      @media (max-width: 767px) {
        .bottom-bar {
          display: flex;
        }
      }
    `
  ];


  static properties = {
    _menuOpen: { state: true },
     _createMenuOpen : {state: true },
     _color: {state: true}
  };

  _router = new Router(this, [
    { path: '/', render: () => html`<home-view></home-view>` },
    { path: '/settings', render: () => html`<settings-view></settings-view>` },
    { path: '/inventory', render: () => html`<inventory-view></inventory-view>` },
    { path: '/category', render: () => html`<category-view></category-view>` },
    { path: '/create-item', render: () => html`<create-item-view></create-item-view>` },
    { path: '/locations', render: () => html`<locations-view></locations-view>` },
    { path: '/search', render: () => html`<search-view></search-view>` },
    { path: '/location/:id', render: (params) => html`<location-details .locationId=${params.id ?? ""}></location-details>` },
    { path: '/category/:id', render: (params) => html`<edit-category-view .categoryId=${params.id}></edit-category-view>` },
    { path: '/hello-world', render: () => html`<hello-world-view></hello-world-view>` },
    { path: '/name-tag', render: () => html`<name-tag-view></name-tag-view>` },
    { path: '/transfer/:id', render: ()=> html`<transfer-item-view></transfer-item-view>`},
    { path: '/create-locations', render: ()=> html`<create-location-view></create-location-view>`},
    { path: '/create-category', render: () => html`<create-category-view></create-category-view>` },
    { path: '/edit/:id', render: (params) => html`<edit-item-view .itemId=${params.id}></edit-item-view>` },
    { path: '/item/:id', render: () => html`<item-details-view></item-details-view>` },
    { path: '/borrow/:id', render: (params) => html`<borrow-item-view .itemId=${params.id}></borrow-item-view>` },
    { path: '/return/:id', render: (params) => html`<return-item-view .itemId=${params.id}></return-item-view>` },
    { path: '/*', render: () => html`<home-view></home-view>` }
  ]);


  constructor() {
    super();
    this._menuOpen = false;
    this._createMenuOpen=false;
        this._color = localStorage.getItem('app-theme-color') || "#212529";
  }

  firstUpdated() {
    const container = this.renderRoot.querySelector('#toastContainer01');
    createToastService(container);
  }

  _toggleMenu() {
    this._menuOpen = !this._menuOpen;
  }

  _openMenu(e) {
    e.stopPropagation();
    
    if (!this._createMenuOpen) {
      this.dispatchEvent(
        new CustomEvent('close-all-menus', {
          bubbles: true,
          composed: true
        })
      );
    }
    this._createMenuOpen = !this._createMenuOpen;
  }

  _closeMenu() {
    this._menuOpen = false;
  }

  _closeCreateMenu() {
    this._createMenuOpen = false;
  }


  render() {
    return html`
<div 
        class="app-layout" 
        style="--app-theme-color: ${this._color};" 
        @click="${() => this._closeCreateMenu()}"  
        @change-color="${this._changeTheColor}">

        <div class="overlay ${this._menuOpen ? 'open' : ''}"
             @click=${this._closeMenu}></div>

        <nav class="sidebar ${this._menuOpen ? 'open' : ''}"  style="color: ${this._color}">          <div class="sidebar-header">
            <h5>ITEM FINDER</h5>
          </div>
          <div class="sidebar-nav" @click=${this._closeMenu}>
            <a href="/">Home</a>
            <a href="/inventory">Inventory</a>
            <a href="/category">Categories</a>
            <a href="/locations">Locations</a>
            <a href="/settings">Settings</a>
          </div>
        </nav>

        <div class="main">
          <div class="topbar">
            <button class="menu-btn" style="width: 45px; height: 45px;" @click=${this._toggleMenu}>&#9776;</button>
            <strong class="h4 m-0 text-center grow">Item Finder</strong>
            <a href="/search" class="search-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
              </svg>
            </a>
          </div>

          <div class="content">
            ${this._router.outlet()}
          </div>
        </div>

        <nav class="bottom-bar" style="color: ${this._color}">
                  <a href="/" @click="${(e) => {
  e.preventDefault();
  window.history.pushState({}, "", "/");
  window.dispatchEvent(new PopStateEvent("popstate"));
}}">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
            <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
          </svg>
        </a>
    <div class="position-relative">
     <a href="#" @click="${(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            this._openMenu(e); 
          }}">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
      </a>

      ${this._createMenuOpen ? html`
        <div class="dropdown-menu show shadow" style="position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); min-width: 150px;">
          <button class="dropdown-item" @click=${() => this._handleAction('/create-item')}>Create Item</button>
          <button class="dropdown-item" @click=${() => this._handleAction('/create-locations')}>Create Location</button>
          <button class="dropdown-item" @click=${() => this._handleAction('/create-category')}>Create Category</button>
        </div>
      ` : ''}
    </div>
        <a href="/settings">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
          </svg>
        </a>
      </nav>

        <toast-container id="toastContainer01"></toast-container>
      </div>
    `;
  }
_changeTheColor = (e) => {
    const newColor = e.detail.color;
    if (!newColor) return;

    this._color = newColor;
    localStorage.setItem('app-theme-color', newColor);
  }

  _handleAction(path) {
    this._createMenuOpen = false;
    const currentPath = window.location.pathname;

    window.history.pushState({ backUrl: currentPath }, "", path);
    
    window.dispatchEvent(new PopStateEvent("popstate"));
    
  }

    connectedCallback() {
    super.connectedCallback();
    this._closeHandler = () => { this._createMenuOpen = false; };
    document.addEventListener('click', this._closeHandler);

    this._closeAllHandler = () => { if (this._createMenuOpen) this._createMenuOpen = false; };
    window.addEventListener('close-all-menus', this._closeAllHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._closeHandler);
    window.removeEventListener('close-all-menus', this._closeAllHandler);
  }
}

customElements.define('app-root', AppRoot);
