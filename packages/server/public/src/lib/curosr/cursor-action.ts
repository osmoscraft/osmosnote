export function openNodeId(id: string, event: KeyboardEvent | MouseEvent) {
  if (event.ctrlKey) {
    window.open(`/?id=${id}`, id); // use id as window name
  } else {
    window.open(`/?id=${id}`, "_self");
  }
}

export function openUrl(url: string, event: KeyboardEvent | MouseEvent) {
  if (event.ctrlKey) {
    window.open(url, url); // use url as window name
  } else {
    window.open(url, "_self");
  }
}
