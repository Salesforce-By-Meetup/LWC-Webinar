import { LightningElement, api } from 'lwc';

/**
 * Returns current timestamp as a string
 * @returns {string}
 */
export const getDateTime = () => {
    return "" + new Date().getTime();
}

export default class ImportExampleUtils extends LightningElement {

    static getDateTime = getDateTime;

    @api getDateTime() {
        return getDateTime();
    }

}