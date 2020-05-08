import { LitElement } from 'lit-element';
export declare class CustomElementFixture<TCustomElement extends LitElement> {
    readonly element: TCustomElement;
    constructor(nodeName: string);
    whenStable(): Promise<void>;
    waitFor(action: () => boolean, timeout?: number): Promise<unknown>;
    $(selector: string, inShadow?: boolean): HTMLElement;
    $$(selector: string): Element[];
    get style(): CSSStyleDeclaration;
    dispose(): void;
    catchEvent<T extends Event = Event>(eventType: string, act: () => Promise<void> | void): Promise<T>;
}
//# sourceMappingURL=CustomElementFixture.d.ts.map