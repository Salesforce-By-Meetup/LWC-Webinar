import { LightningElement } from 'lwc';

import ImportExampleUtils, {getDateTime as getBundleDateTime} from "c/importExampleUtils";

import getDefaultFileDateTime, {getDateTime as getFileDateTime} from "./importExampleContainerUtils";

/**
 * Returns current timestamp as a string
 * @returns {string}
 */
const getDateTime = () => {
    return "" + new Date().getTime();
}

export default class ImportExampleContainer extends LightningElement {

    timestamp;

    connectedCallback() {
        this.timestamp = getDateTime();
    }

    handleSameFileUpdateClick() {
        this.timestamp = getDateTime();
    }

    handleAnotherFileUpdateClick() {
        this.timestamp = getFileDateTime();
    }

    handleAnotherFileDefaultUpdateClick() {
        this.timestamp = getDefaultFileDateTime();
    }

    handleBundleUpdateClick() {
        this.timestamp = getBundleDateTime();
    }

    handleBundleDefaultUpdateClick() {
        this.timestamp = ImportExampleUtils.getDateTime();
    }

    handleComponentUpdateClick() {
        const utilsComponent = this.template.querySelector('c-import-example-utils');
        this.timestamp = utilsComponent.getDateTime();
    }

}