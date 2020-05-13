"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class CustomElementFixture {
    constructor(nodeName) {
        this.element = document.createElement(nodeName);
        document.body.append(this.element);
    }
    whenStable() {
        return __awaiter(this, void 0, void 0, function* () {
            while (!(yield this.element.updateComplete))
                ;
        });
    }
    waitFor(action, timeout = 500) {
        const step = 50;
        return new Promise((res, rej) => {
            function tick(timeLeft) {
                if (action()) {
                    res();
                }
                else if (timeLeft <= 0) {
                    rej(new Error(`Condition not met in ${timeout} ms: ${action}`));
                }
                else {
                    setTimeout(() => tick(timeLeft - step), step);
                }
            }
            tick(timeout);
        });
    }
    $(selector, inShadow = true) {
        if (inShadow) {
            return this.element.shadowRoot.querySelector(selector);
        }
        else {
            return this.element.querySelector(selector);
        }
    }
    $$(selector) {
        return [...this.element.shadowRoot.querySelectorAll(selector)];
    }
    get style() {
        return getComputedStyle(this.element);
    }
    dispose() {
        return this.element.remove();
    }
    catchEvent(eventType, act) {
        return __awaiter(this, void 0, void 0, function* () {
            let actual;
            const eventListener = (evt) => (actual = evt);
            this.element.addEventListener(eventType, eventListener);
            try {
                yield act();
                yield this.whenStable();
            }
            finally {
                this.element.removeEventListener(eventType, eventListener);
            }
            return actual;
        });
    }
}
exports.CustomElementFixture = CustomElementFixture;
//# sourceMappingURL=CustomElementFixture.js.map