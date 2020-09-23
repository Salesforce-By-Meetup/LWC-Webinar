import { LightningElement } from "c/lightningCommons";

import FormattedPhoneTemplate from "./formattedPhoneTemplate.html";
import FormattedTextTemplate from "./formattedTextTemplate.html";

export default class MultiTemplateContainer extends LightningElement {
    currentTimestamp;

    mode = "view";

    get isView() {
        return this.mode === "view";
    }

    connectedCallback() {
        this.setTimestamp();
    }

    handleRefreshButtonClick() {
        this.setTimestamp();
    }

    setTimestamp() {
        this.currentTimestamp = "" + new Date().getTime();
    }

    handleEditClick() {
        this.mode = "edit";
        this.$("c-multi-template-example").saveValue();
    }

    handleSaveClick() {
        this.mode = "view";
        console.log(this.$("c-multi-template-example").value);
    }

    handleCancelClick() {
        this.mode = "view";
        this.$("c-multi-template-example").restoreValue();
        console.log(this.$("c-multi-template-example").value);
    }

    handlePhoneTemplateSelectClick() {
        this.$("c-multi-template-example-dynamic").dynamicTemplate = FormattedPhoneTemplate;
    }
    handleTextTemplateSelectClick() {
        this.$("c-multi-template-example-dynamic").dynamicTemplate = FormattedTextTemplate;
    }
}
