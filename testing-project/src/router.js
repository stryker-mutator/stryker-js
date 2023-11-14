export class Router {
  #global;
  /** @type {Set<RouteCallback>} */
  #routerSubscriptions = new Set();

  /** @param {Pick<globalThis, 'addEventListener'> & { location: { hash: string }}} win */
  constructor(win = window) {
    this.#global = win;
    this.#global.addEventListener('hashchange', () => {
      this.#routerSubscriptions.forEach((sub) => sub(this.#currentRoute));
    });
  }

  /** @param {string} route */
  next(route) {
    this.#currentRoute = route;
  }
  /** @param {RouteCallback} callback */
  onNext(callback) {
    this.#routerSubscriptions.add(callback);
    callback(this.#currentRoute);
    return () => {
      this.#routerSubscriptions.delete(callback);
    };
  }

  get #currentRoute() {
    return this.#global.location.hash.substring(1);
  }
  set #currentRoute(route) {
    this.#global.location.hash = route;
  }
}

export const router = new Router();
