import { LightningElement, api } from 'lwc';

/**
 * @typedef {string} Timestamp
 */

/**
 * Returns current timestamp as a string
 * @returns {Timestamp}
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