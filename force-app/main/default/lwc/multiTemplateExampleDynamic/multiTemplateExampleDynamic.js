import { LightningElement, api } from "lwc";

import standardTemplate from "./multiTemplateExampleDynamic.html";

export default class MultiTemplateExampleDynamic extends LightningElement {
    @api set dynamicTemplate(newTemplate) {
        this._dynamicTemplate = newTemplate;
    }
    get dynamicTemplate() {
        return this._dynamicTemplate;
    }
    @api value;

    _dynamicTemplate;

    render() {
        if (this.dynamicTemplate) {
            return this.dynamicTemplate;
        }
        return standardTemplate;
    }
}
