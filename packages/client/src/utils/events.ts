/**
 * 
// Use this snippet to inject typing to global event types 

declare global {
  interface GlobalEventHandlersEventMap {
    // "my-componet:event-name-1": CustomEvent<never>;
    // "my-componet:event-name-2": CustomEvent<DetailsType>;
  }
}
 */

/**
 * Emit an event with typed payload
 */
export function emit<
  K extends keyof GlobalEventHandlersEventMap,
  T extends InitOfCustomEvent<GlobalEventHandlersEventMap[K]>
>(source: HTMLElement, type: K, init?: T) {
  const event = new CustomEvent(type, init);
  source.dispatchEvent(event);
}

export type InitOfCustomEvent<T> = T extends CustomEvent<infer U> ? CustomEventInit<U> : never;
