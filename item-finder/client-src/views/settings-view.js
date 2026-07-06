import { html, css } from "lit";
import { BSLitElement } from "../base/bs-lit-element.js";
import { InventoryService } from "../services/inventory-service.js";

export class SettingsView extends BSLitElement {
  static styles = [
    ...BSLitElement.styles,
    css`
      :host {
        display: block;
      }

      .settings-card {
        background: white;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        padding: 25px;
        margin-top: 20px;
        border: 1px solid #dee2e6;
      }

      .palette {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 15px;
      }

      .color-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid #dee2e6;
        cursor: pointer;
        transition: transform 0.2s, border-color 0.2s;
        padding: 0;
      }

      .color-btn:hover {
        transform: scale(1.1);
        border-color: #212529;
      }

      @media print {
        .no-print,
        .btn,
        .header {
          display: none !important;
        }
        .settings-card {
          box-shadow: none !important;
          border: none !important;
        }
      }
    `,
  ];


  static properties = {
    _items: { type: Array, state: true },
  };

  constructor() {
    super();
    this._items = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadAllItems();
  }

  render() {
        const colors = [
      '#dc3545', '#198754', '#0d6efd', 
      '#ffc107', '#6f42c1', '#fd7e14', 
      '#212529', '#6c757d', '#0dcaf0', '#CF95CB'
    ];

    return html`
      <div class="container mt-4 no-print">
        <h2>Settings</h2>
        
        <div class="settings-card">
          <h5 class="mb-3">Data Export / Import</h5>
          <p class="text-mute">Export and Import all inventory items into your preferred format:</p>
          
          <div class="d-flex gap-2">
            <button class="btn btn-outline-success d-flex align-items-center" @click="${this._onExportCSV}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-filetype-csv" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM3.517 14.841a1.13 1.13 0 0 0 .401.823q.195.162.478.252.284.091.665.091.507 0 .859-.158.354-.158.539-.44.187-.284.187-.656 0-.336-.134-.56a1 1 0 0 0-.375-.357 2 2 0 0 0-.566-.21l-.621-.144a1 1 0 0 1-.404-.176.37.37 0 0 1-.144-.299q0-.234.185-.384.188-.152.512-.152.214 0 .37.068a.6.6 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.1 1.1 0 0 0-.2-.566 1.2 1.2 0 0 0-.5-.41 1.8 1.8 0 0 0-.78-.152q-.439 0-.776.15-.337.149-.527.421-.19.273-.19.639 0 .302.122.524.124.223.352.367.228.143.539.213l.618.144q.31.073.463.193a.39.39 0 0 1 .152.326.5.5 0 0 1-.085.29.56.56 0 0 1-.255.193q-.167.07-.413.07-.175 0-.32-.04a.8.8 0 0 1-.248-.115.58.58 0 0 1-.255-.384zM.806 13.693q0-.373.102-.633a.87.87 0 0 1 .302-.399.8.8 0 0 1 .475-.137q.225 0 .398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.4 1.4 0 0 0-.489-.272 1.8 1.8 0 0 0-.606-.097q-.534 0-.911.223-.375.222-.572.632-.195.41-.196.979v.498q0 .568.193.976.197.407.572.626.375.217.914.217.439 0 .785-.164t.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.8.8 0 0 1-.118.363.7.7 0 0 1-.272.25.9.9 0 0 1-.401.087.85.85 0 0 1-.478-.132.83.83 0 0 1-.299-.392 1.7 1.7 0 0 1-.102-.627zm8.239 2.238h-.953l-1.338-3.999h.917l.896 3.138h.038l.888-3.138h.879z"/>
</svg>  
            Export
            </button>

            <button class="btn btn-outline-danger d-flex align-items-center" @click="${this._onExportPDF}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-pdf" viewBox="0 0 16 16">
  <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
  <path d="M4.603 14.087a.8.8 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.7 7.7 0 0 1 1.482-.645 20 20 0 0 0 1.062-2.227 7.3 7.3 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a11 11 0 0 0 .98 1.686 5.8 5.8 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.86.86 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.7 5.7 0 0 1-.911-.95 11.7 11.7 0 0 0-1.997.406 11.3 11.3 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.8.8 0 0 1-.58.029m1.379-1.901q-.25.115-.459.238c-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361q.016.032.026.044l.035-.012c.137-.056.355-.235.635-.572a8 8 0 0 0 .45-.606m1.64-1.33a13 13 0 0 1 1.01-.193 12 12 0 0 1-.51-.858 21 21 0 0 1-.5 1.05zm2.446.45q.226.245.435.41c.24.19.407.253.498.256a.1.1 0 0 0 .07-.015.3.3 0 0 0 .094-.125.44.44 0 0 0 .059-.2.1.1 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a4 4 0 0 0-.612-.053zM8.078 7.8a7 7 0 0 0 .2-.828q.046-.282.038-.465a.6.6 0 0 0-.032-.198.5.5 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822q.036.167.09.346z"/>
</svg>  
            Export
            </button>

            <button class="btn btn-outline-primary d-flex align-items-center" @click="${this._triggerFileInput}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-filetype-csv" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM3.517 14.841a1.13 1.13 0 0 0 .401.823q.195.162.478.252.284.091.665.091.507 0 .859-.158.354-.158.539-.44.187-.284.187-.656 0-.336-.134-.56a1 1 0 0 0-.375-.357 2 2 0 0 0-.566-.21l-.621-.144a1 1 0 0 1-.404-.176.37.37 0 0 1-.144-.299q0-.234.185-.384.188-.152.512-.152.214 0 .37.068a.6.6 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.1 1.1 0 0 0-.2-.566 1.2 1.2 0 0 0-.5-.41 1.8 1.8 0 0 0-.78-.152q-.439 0-.776.15-.337.149-.527.421-.19.273-.19.639 0 .302.122.524.124.223.352.367.228.143.539.213l.618.144q.31.073.463.193a.39.39 0 0 1 .152.326.5.5 0 0 1-.085.29.56.56 0 0 1-.255.193q-.167.07-.413.07-.175 0-.32-.04a.8.8 0 0 1-.248-.115.58.58 0 0 1-.255-.384zM.806 13.693q0-.373.102-.633a.87.87 0 0 1 .302-.399.8.8 0 0 1 .475-.137q.225 0 .398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.4 1.4 0 0 0-.489-.272 1.8 1.8 0 0 0-.606-.097q-.534 0-.911.223-.375.222-.572.632-.195.41-.196.979v.498q0 .568.193.976.197.407.572.626.375.217.914.217.439 0 .785-.164t.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.8.8 0 0 1-.118.363.7.7 0 0 1-.272.25.9.9 0 0 1-.401.087.85.85 0 0 1-.478-.132.83.83 0 0 1-.299-.392 1.7 1.7 0 0 1-.102-.627zm8.239 2.238h-.953l-1.338-3.999h.917l.896 3.138h.038l.888-3.138h.879z"/>
</svg>    
            Import
            </button>

            <input 
              id="csvFileInput" 
              type="file" 
              accept=".csv" 
              style="display: none;" 
              @change="${this._onImportCSV}"
            />
          </div>
        </div>
        
        <div class="settings-card">
          <h5 class="mb-3">Change Theme</h5>
          <p class="text-muted">Choose the theme of your App.</p>

          <div class="palette">
            ${colors.map(color => html`
              <button 
                class="color-btn" 
                style="background-color: ${color};" 
                @click=${() => this._changeTheColor(color)}>
              </button>
            `)}
          </div>
        </div>
      </div>

    `;
  }

  _changeTheColor(color) {
    console.log("Selected color:", color);
    this.dispatchEvent(
      new CustomEvent("change-color", {
        detail: { color: color },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onExportCSV() {
    InventoryService.exportAsCSV(this._items);
  }

  _onExportPDF() {
    InventoryService.exportAsPDF(this._items);
  }

  _triggerFileInput() {
    this.shadowRoot.getElementById("csvFileInput").click();
  }

  async _onImportCSV(event) {
    await InventoryService.handleCSVImport(event, () => this._loadAllItems());
    const fileInput = this.shadowRoot.getElementById("csvFileInput");
    if (fileInput) {
      fileInput.value = "";
    }
  }

  _loadAllItems() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/items");
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        this._items = JSON.parse(xhr.responseText);
      }
    });
    xhr.send();
  }
}

customElements.define("settings-view", SettingsView);