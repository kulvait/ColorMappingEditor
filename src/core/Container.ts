/** This class handles common functionality of all components in this library. */
export default class Container {
  /** The root element, in which the component gets embedded. */
  protected readonly parent: HTMLElement;

  constructor(container: HTMLElement | string) {
    // Figure out which element we want to embed in.
    if (container) {
      if (typeof container === 'string') {
        this.parent = document.querySelector(container);
      } else {
        this.parent = container;
      }
    } else {
      throw 'No element given!';
    }
  }

  /** Default destroy method to be overridden by subclasses. */
  destroy(): void {
    // Default implementation does nothing.
  }
}
