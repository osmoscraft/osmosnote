const searchBoxDom = document.getElementById("search-box");
const searchResultsDom = document.getElementById("search-results");
const recentNotesDom = document.getElementById("recent-notes");

searchBoxDom.addEventListener("input", async (e) => {
  if (e.target.value.length) {
    const params = new URLSearchParams({
      phrase: e.target.value,
    });

    const response = await fetch(`/api/search?${params.toString()}`);
    const result = await response.json();
    const items = result.items;

    searchResultsDom.innerHTML = items
      .map((item) => `<a href="/editor.html?filename=${encodeURIComponent(item.filename)}">${item.title}</a>`)
      .join("\n");

    console.log(result.durationInMs);
  } else {
    searchResultsDom.innerHTML = "";
  }
});

async function loadRecentNotes() {
  const response = await fetch(`/api/notes`);
  const items = (await response.json()).notes;

  recentNotesDom.innerHTML = items
    .map((item) => `<a href="/editor.html?filename=${encodeURIComponent(item.filename)}">${item.title}</a>`)
    .join("\n");
}

loadRecentNotes();
