export function getHeaderRow(title: string) {
  return /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--header">${title}</div>`;
}

export function getMessageRow(message: string) {
  return /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--message">${message}</div>`;
}
