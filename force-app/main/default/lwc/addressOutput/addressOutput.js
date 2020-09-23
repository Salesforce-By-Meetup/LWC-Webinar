import { LightningElement } from "lwc";

import { loadStyle } from "lightning/platformResourceLoader";

import LightningStylesheetOverride from "@salesforce/resourceUrl/lightningStylesheetOverride";

const AddressViewOverrideStylesheet = LightningStylesheetOverride + "/stylesheetOverrideAccountAddressEditor.css";

export default class AddressOutput extends LightningElement {
    connectedCallback() {
        loadStyle(this, AddressViewOverrideStylesheet);
    }
}
