const noteTitleElement = document.getElementById("note-title") as HTMLElement;
const noteContentElement = document.getElementById("note-content") as HTMLElement;

async function loadNote() {
  const url = new URL(location.href);
  const searchParams = new URLSearchParams(url.search);

  const filename = searchParams.get("filename")!;
  console.log(filename);

  const id = filename.split(".md")[0];

  const response = await fetch(`/api/notes/${encodeURIComponent(id)}`);
  const result = await response.json();

  noteTitleElement.innerHTML = result.title;
  noteContentElement.innerHTML = result.content;
}

loadNote();
