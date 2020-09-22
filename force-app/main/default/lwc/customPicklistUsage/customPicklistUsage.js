import { LightningElement } from 'lwc';

import { CustomPicklistChangeEvent } from "c/customPicklist";

export default class CustomPicklistUsage extends LightningElement {
    options = [
        {label: "Aura", value: "aura"},
        {label: "LWC", value: "lwc"}
    ];

    label = "Best Lightning Component Framework"

    /**
     * @param {CustomPicklistChangeEvent} event event of changing custom picklist
     */
    handlePicklistChange(event) {
        console.log(event.detail.label);
        console.log(event.detail.value);
    }
}