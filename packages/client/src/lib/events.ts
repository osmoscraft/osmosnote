export function emit<
  K extends keyof GlobalEventHandlersEventMap,
  T extends InitOfCustomEvent<GlobalEventHandlersEventMap[K]>
>(source: HTMLElement, type: K, init?: T) {
  const event = new CustomEvent(type, init);
  source.dispatchEvent(event);
}

export type InitOfCustomEvent<T> = T extends CustomEvent<infer U> ? CustomEventInit<U> : never;
