import { LightningElement, wire } from 'lwc';

import { getObjectInfo } from "lightning/uiObjectInfoApi"
import { ObjectInfoRepresentation } from "lightning/uiRecordApi";

import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class AccountSobjectDefinitionFetcher extends LightningElement {

    get label() {
        return this.accountObjectInfo.data.label;
    }

    /**
     * Account SObject information
     * @type {{data: ObjectInfoRepresentation}}
     */
    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    accountObjectInfo

}