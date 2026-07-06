import { html } from "lit";
import "../components/item-card.js";
import { BSLitElement } from "../base/bs-lit-element.js";

class HomeView extends BSLitElement {
  static properties = {
    favoriteItems: { type: Array },
    itemCount: { type: Number },
    categoryCount: { type: Number },
    locationCount: { type: Number },
    borrowedCount: { type: Number },
  };

  constructor() {
    super();
    this.favoriteItems = [];
    this.itemCount = 0;
    this.categoryCount = 0;
    this.locationCount = 0;
    this.borrowedCount = 0;
  }

_fetchAndCount(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText);
        callback(data);
      } catch (err) {
        console.error(`Error fetching ${url}:`, err);
      }
    });
    xhr.send();
  }

  _loadAllStats() {
    this._fetchAndCount("/api/items", (data) => {
      this.itemCount = data.length;
      this.favoriteItems = data.filter((i) => i.favorite);
      this.borrowedCount = data.filter((i) => i.borrowed).length;
    });

    this._fetchAndCount("/api/categories", (data) => {
      console.log(data)
            console.log(data.length)

      this.categoryCount = data.length;
    });

    this._fetchAndCount("/api/locations", (data) => {
      this.locationCount = data.length;
    });

  }

  firstUpdated() {
    this._loadAllStats();
  }


  render() {
    return html`
      <div class="container mt-2 border rounded p-3 text-center">
        <h1 id="greeting">Hello</h1>
      </div>

      <div class="container mt-2 border rounded p-3">
        <div class="d-flex flex-row justify-content-around align-items-start justify-content-center" style="font-size:small">
          <div class="d-flex flex-column align-items-center">
            <div
              class="d-flex justify-content-center align-items-center border border-2 rounded-4 mb-2"
              style="width: 70px; height: 70px;"
              @click="${()=> window.location.href = '/inventory'}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-box-seam" viewBox="0 0 16 16">
                <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/>
              </svg>
            </div>
            <div class="text-center">
              <span class="fw-bold d-block">${this.itemCount}</span>
              <span class="text-muted">Items</span>
            </div>
          </div>

          <div class="d-flex flex-column align-items-center">
            <div
              class="d-flex justify-content-center align-items-center border border-2 rounded-4 mb-2"
              style="width: 70px; height: 70px;"
               @click="${()=> window.location.href = '/category'}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-tags-fill" viewBox="0 0 16 16">
                <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z"/>
              </svg>

            </div>
            <div class="text-center">
              <span class="fw-bold d-block">${this.categoryCount}</span>
              <span class="text-muted">Categories</span>
            </div>
          </div>

          <div class="d-flex flex-column align-items-center">
            <div
              class="d-flex justify-content-center align-items-center border border-2 rounded-4 mb-2"
              style="width: 70px; height: 70px;"
               @click="${()=> window.location.href = '/locations'}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
              </svg>
            </div>
            <div class="text-center">
              <span class="fw-bold d-block">${this.locationCount}</span>
              <span class="text-muted">Locations</span>
            </div>
          </div>

          <div class="d-flex flex-column align-items-center">
            <div
              class="d-flex justify-content-center align-items-center border border-2 rounded-4 mb-2"
              style="width: 70px; height: 70px;"
               @click="${() => window.location.href = '/search?borrowed=true'}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-box2-heart" viewBox="0 0 16 16">
                <path d="M8 7.982C9.664 6.309 13.825 9.236 8 13 2.175 9.236 6.336 6.31 8 7.982"/>
                <path d="M3.75 0a1 1 0 0 0-.8.4L.1 4.2a.5.5 0 0 0-.1.3V15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4.5a.5.5 0 0 0-.1-.3L13.05.4a1 1 0 0 0-.8-.4zm0 1H7.5v3h-6zM8.5 4V1h3.75l2.25 3zM15 5v10H1V5z"/>
              </svg>
            </div>
            <div class="text-center">
              <span class="fw-bold d-block">${this.borrowedCount}</span>
              <span class="text-muted">Borrowed</span>
            </div>
          </div>

        </div>
      </div>

      <div id="favorites" class="container mt-2 border rounded p-3">
        <div class="d-flex align-items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-star-fill me-2"
            viewBox="0 0 16 16"
          >
            <path
              d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
            />
          </svg>

          <p class="m-0 fs-4">Favorites</p>
        </div>

        <div id="favoritesList" class="container m-[0.5] border rounded p-1">
          <item-list .items="${this.favoriteItems.sort((item1, item2) => {
            const name1 = item1.name ? item1.name.toLowerCase() : '';
            const name2 = item2.name ? item2.name.toLowerCase() : '';
            return name1.localeCompare(name2);
          })}"></item-list>
        </div>
      </div>
    `;
  }
}

customElements.define("home-view", HomeView);
