export interface CreateElementProps {
  class?: string[];
  dataset?: any;
}

export type CreateFragmentInput = [children?: (string | Node)[]];

export function frag(...args: CreateFragmentInput): DocumentFragment {
  const [children] = args;
  let currentNode = document.createDocumentFragment();

  if (children) {
    children.forEach((child) => {
      currentNode.append(child);
    });
  }

  return currentNode;
}

export type CreateElementInput = [name: string, props?: CreateElementProps | null, children?: (string | Node)[]];

/**
 * A lightweight version of createElement for real dom, instead of vDom.
 */
export function elem(...args: CreateElementInput): HTMLElement {
  const [name, props, children] = args;
  let currentNode = document.createElement(name);

  if (props?.class) {
    currentNode.classList.add(...props.class);
  }

  if (props?.dataset) {
    Object.assign(currentNode.dataset, props.dataset);
  }

  if (children) {
    children.forEach((child) => {
      currentNode.append(child);
    });
  }

  return currentNode;
}
