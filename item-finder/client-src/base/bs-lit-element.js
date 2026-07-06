import { LitElement } from 'lit';
import bootstrapCSS from "bootstrap/dist/css/bootstrap.min.css?inline";

const bootstrapSheet = new CSSStyleSheet();
bootstrapSheet.replaceSync(bootstrapCSS);

export class BSLitElement extends LitElement {
  static styles = [bootstrapSheet];
}
