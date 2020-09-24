import { LightningElement as LightningElementBase } from "lwc";

/**
 * @template T
 * @typedef {(baseClass: T) => T} Mixin
 */

/**
 * Applies all mixins to the base class
 * @template T
 * @param {T} baseClass class to mix functionality in
 * @param {...Mixin} mixins list of the mixins
 * @returns {T}
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

/**
 * Creates LightningElement class with some helper functions
 * @template T
 * @param {T} baseClass
 * @returns {T & {with: (...mixins: Mixin<T>) => T}} class with mixed-in helping functions
 */
const LightningBaseMixin = (baseClass) => {
    return class extends baseClass {
        static with = (...mixins) => {
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
