import { LightningElement } from 'lwc';

import { LOG } from "c/testComponent";

export default class DataStoringDemoContainer extends LightningElement {

    currentTimestamp;

    connectedCallback() {
        this.setTimestamp();
    }

    handleRefreshButtonClick() {
        this.setTimestamp();
    }

    setTimestamp() {
        this.currentTimestamp = ""+new Date().getTime();
    }

    mode = "view";

    get isView() {
        return this.mode === "view";
    }

    handleEditClick() {
        this.mode = "edit";
        this.template.querySelector("c-data-passing-example").saveValue();
    }

    handleSaveClick() {
        this.mode = "view";
        LOG(this.template.querySelector("c-data-passing-example").value);
    }

    handleCancelClick() {
        this.mode = "view";
        this.template.querySelector('c-data-passing-example').restoreValue();
        LOG(this.template.querySelector("c-data-passing-example").value);
    }

}
