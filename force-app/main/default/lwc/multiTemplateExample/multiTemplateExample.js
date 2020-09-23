import { LightningElement, api } from "lwc";

import { getFormattedPhone } from "c/dataStoringUtils";

import templateEdit from "./multiTemplateExampleEdit.html";
import templateView from "./multiTemplateExampleView.html";

export default class MultiTemplateExample extends LightningElement {
    @api mode;

    @api set value(newValue) {
        this._value = newValue;
    }
    get value() {
        return this._value;
    }

    @api saveValue() {
        this._savedValue = this._value;
    }
    @api restoreValue() {
        this._value = this._savedValue;
    }

    _value;
    _savedValue;

    get displayValue() {
        return getFormattedPhone(this._value);
    }

    render() {
        if (this.mode === "view") {
            return templateView;
        } else if (this.mode === "edit") {
            return templateEdit;
        }
        return undefined;
    }

    handleInputChange(event) {
        this._value = event.target.value;
    }
}
