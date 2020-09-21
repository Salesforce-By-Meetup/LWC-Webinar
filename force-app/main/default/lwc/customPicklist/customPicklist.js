import { LightningElement, api } from 'lwc';

/**
 * @typedef {{label: string, value: string}} PicklistOption
 */

/**
 * @typedef {CustomEvent<PicklistOption>} CustomPicklistChangeEvent
 */

export default class CustomPicklist extends LightningElement {

    @api label;
    @api value;

    /**
     * @type {PicklistOption[]}
     */
    @api options;

    handlePicklistChange(event) {
        event.preventDefault();
        const selectedOption = this.options.find(({value}) => value === event.target.value);
        this.dispatchEvent(new CustomEvent("change", {detail: selectedOption}));
    }

}