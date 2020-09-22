import { LightningElement } from 'lwc';

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
        console.log(this.template.querySelector("c-data-passing-example").value);
    }

    handleCancelClick() {
        this.mode = "view";
        this.template.querySelector('c-data-passing-example').restoreValue();
        console.log(this.template.querySelector("c-data-passing-example").value);
    }

}
