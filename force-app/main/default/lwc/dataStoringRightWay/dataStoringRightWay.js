import { LightningElement, api } from 'lwc';

import { getFormattedPhone } from "c/dataStoringUtils";

export default class DataStoringRightWay extends LightningElement {

    isFocus = false;
    _value = "";

    @api set value(newValue) {
        this._value = newValue;
    }
    get value() {
        return this._value;
    }

    handlePhoneFucus() {
        this.isFocus = true;
    }

    handlePhoneBlur() {
        this.isFocus = false;
    }

    handlePhoneChange(event) {
        this._value = event.target.value
    }

    get displayValue() {
        if (!this.isFocus) {
            return getFormattedPhone(this._value);
        }
        return this._value;
    }
}
