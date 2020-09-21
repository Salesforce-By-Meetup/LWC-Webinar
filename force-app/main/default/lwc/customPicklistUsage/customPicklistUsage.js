import { LightningElement } from 'lwc';

import { CustomPicklistChangeEvent } from "c/customPicklist";


export default class CustomPicklistUsage extends LightningElement {
    options = [
        {label: "aura", value: "Aura"},
        {label: "lwc", value: "LWC"}
    ]

    /**
     * @param {CustomPicklistChangeEvent} event event of changing custom picklist
     */
    handleChange(event) {

    }
}