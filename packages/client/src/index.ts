import type { SearchReplay } from "@system-two/server/src/routes/search";
import type { NoteListReply } from "@system-two/server/src/routes/note-list";

const searchBoxDom = document.getElementById("search-box") as HTMLInputElement;
const searchResultsDom = document.getElementById("search-results") as HTMLElement;
const recentNotesDom = document.getElementById("recent-notes") as HTMLElement;

searchBoxDom.addEventListener("input", async (e) => {
  if (searchBoxDom.value.length) {
    const params = new URLSearchParams({
      phrase: searchBoxDom.value,
    });

    const response = await fetch(`/api/search?${params.toString()}`);
    const result: SearchReplay = await response.json();

    searchResultsDom.innerHTML = result.items
      .map((item) => `<a href="/editor.html?filename=${encodeURIComponent(item.filename)}">${item.title}</a>`)
      .join("\n");

    console.log(result.durationInMs);
  } else {
    searchResultsDom.innerHTML = "";
  }
});

async function loadRecentNotes() {
  const response = await fetch(`/api/notes`);
  const result: NoteListReply = await response.json();

  recentNotesDom.innerHTML = result.notes
    .map((item) => `<a href="/editor.html?filename=${encodeURIComponent(item.filename)}">${item.title}</a>`)
    .join("\n");
}

loadRecentNotes();
