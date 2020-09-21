import { LightningElement, api } from 'lwc';

import { getFormattedPhone } from "c/dataStoringUtils";


/**
 * By given readable phone number returns only numeric symbols
 * @param {string} formattedPhone phone with spaces, dashes, brackets
 */
const getNumbersFromFormattedPhone = formattedPhone => {
    return formattedPhone.replace(/[\s\(\)\[\]\{\}\-\+\_\=\*\#]/g, "");
}

export default class DataStoringWrongWay extends LightningElement {

    isFocus = false;

    @api set value(newValue) {
        if (this.isFocus) {
            this.inputValue = newValue;
        } else {
            this.inputValue = getFormattedPhone(newValue);
        }
    }
    get value() {
        return getNumbersFromFormattedPhone(this.inputValue);
    }

    get inputValue() {
        const input = this.template.querySelector("lightning-input.phone-input");
        if (input !== null) {
            return input.value;
        }
        return undefined;
    }

    set inputValue(newValue) {
        const input = this.template.querySelector("lightning-input.phone-input");
        if (input !== null) {
            input.value = newValue;
        }

        /*
        //ISSUE: The value is not set on initializing - workaround 1
        // Set timeout to set the value after the first render process
        else setTimeout(() => {
            const input = this.template.querySelector("lightning-input.phone-input");
            if (input !== null) {
                input.value = newValue;
            }
        }, 0);
        // workaround 1 end
        */


        /*
        //ISSUE: The value is not set on initializing - workaround 2
        // store new value in a field and update the input in `renderedCallback`
        else this._value = newValue;
    }

    renderedCallback() {
        if (this._value !== undefined) {
            const input = this.template.querySelector("lightning-input.phone-input");
            if (input !== null) {
                input.value = this._value;
                this._value = undefined;
            }
        }
        // workaround 2 end
        */

    }

    handlePhoneFucus() {
        this.isFocus = true;
        this.inputValue = getNumbersFromFormattedPhone(this.inputValue);
    }

    handlePhoneBlur() {
        this.isFocus = false;
        this.inputValue = getFormattedPhone(this.inputValue);
    }
}