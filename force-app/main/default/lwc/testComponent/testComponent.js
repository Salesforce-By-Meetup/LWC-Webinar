import { LightningElement, api} from 'lwc';

export const LOG = (...args) => console.log.apply(window, args);

export default class TestComponent extends LightningElement {

    @api LOG = LOG;

};
