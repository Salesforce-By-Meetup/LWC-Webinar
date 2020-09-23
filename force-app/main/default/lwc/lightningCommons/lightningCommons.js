import { LightningElement as LightningElementBase } from "lwc";

/**
 * Applies all mixins to the base class
 * @param {Function} baseClass class to mix functionality in
 * @param {...(baseClass: Function) => Function} mixins list of the mixins
 */
const compose = function (baseClass, ...mixins) {
    if (mixins.length > 0) {
        if (mixins.length === 1) {
            return mixins[0](baseClass);
        }
        return mixins.reduce((mixedClass, currentMixin) => currentMixin(mixedClass), baseClass);
    }
    return baseClass;
};

const LightningBaseMixin = (baseClass) => {
    return class extends baseClass {
        static with = function (...mixins) {
            return compose(this, ...mixins);
        };
        $(selector) {
            return this.template.querySelector(selector);
        }
        $$(selector) {
            return this.template.querySelectorAll(selector);
        }
        fire(name, detail, bubbles = false, composed = false) {
            this.dispatchEvent(new CustomEvent(name, { detail, bubbles, composed }));
        }
    };
};

const LightningElement = LightningBaseMixin(LightningElementBase);

export { compose, LightningBaseMixin, LightningElement };
