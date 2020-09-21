import { LightningElement, api } from 'lwc';

import { getFormattedPhone } from "c/dataStoringUtils";

export default class DataPassingExample extends LightningElement {

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

    get isView() {
        return this.mode === "view";
    }

    get isEdit() {
        return this.mode === "edit";
    }

    handleInputChange(event) {
        this._value = event.target.value;
    }


}