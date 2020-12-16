import type {
  CreateNoteBody,
  CreateNoteReply,
  GetNoteReply,
  UpdateNoteBody,
  UpdateNoteReply,
} from "@system-two/server/src/routes/note";
import type { SearchResult } from "@system-two/server/src/routes/search";
import { sendToClipboard } from "./lib/clipboard";
import { editableNoteToMarkdown, markdownToEditableHtml, markdownToOverlayHtml } from "./lib/codec";
import { restoreRange, saveRange } from "./lib/curosr";
import { filenameToId } from "./lib/id";

const noteTitleDom = document.getElementById("note-title") as HTMLElement;
const noteEditableDom = document.getElementById("note-editable") as HTMLElement;
const noteOverlayDom = document.getElementById("note-overlay") as HTMLElement;
const saveButtonDom = document.getElementById("save") as HTMLButtonElement;
const searchBoxDom = document.getElementById("search-box") as HTMLInputElement;
const searchResultsDom = document.getElementById("search-results") as HTMLElement;

async function loadNote() {
  const { filename, title, content } = getNoteConfigFromUrl();

  if (filename) {
    // load existing note
    const id = filenameToId(filename);
    const result = await loadExistingNote(id);
    noteEditableDom.innerHTML = markdownToEditableHtml(result.note.content);
    noteOverlayDom.innerHTML = markdownToOverlayHtml(result.note.content);

    const observer = new MutationObserver(function () {
      const newContent = editableNoteToMarkdown(noteEditableDom);
      noteOverlayDom.innerHTML = markdownToOverlayHtml(newContent);
    });

    observer.observe(noteEditableDom, { subtree: true, childList: true, characterData: true });

    noteEditableDom.addEventListener("keydown", (event) => {
      console.log(event);
      if (event.key === "/") {
        event.stopPropagation();
        event.preventDefault();
        saveRange();
        searchBoxDom.focus();
      }
    });

    searchBoxDom.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        restoreRange();
      }
    });

    searchBoxDom.addEventListener("input", async (e) => {
      if (searchBoxDom.value.length) {
        const params = new URLSearchParams({
          phrase: searchBoxDom.value,
        });

        const response = await fetch(`/api/search?${params.toString()}`);
        const result: SearchResult = await response.json();

        searchResultsDom.innerHTML = result.items
          .map((item) => `<button data-link="[${item.title}](${filenameToId(item.filename)})">${item.title}</button>`)
          .join("");
      } else {
        searchResultsDom.innerHTML = "";
      }
    });

    searchResultsDom.addEventListener("click", (e) => {
      const linkMarkdown = (e.target as HTMLButtonElement)?.dataset?.link;
      if (linkMarkdown) {
        searchBoxDom.value = "";
        searchResultsDom.innerHTML = "";
        sendToClipboard(linkMarkdown);
        restoreRange();
      }
    });

    saveButtonDom.addEventListener("click", async () => {
      // save changes to note
      const updateNoteBody: UpdateNoteBody = {
        note: {
          metadata: {
            title: noteTitleDom.innerText,
          },
          content: editableNoteToMarkdown(noteOverlayDom),
        },
      };

      const response = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateNoteBody),
      });
      const result: UpdateNoteReply = await response.json();

      console.log(`[editor] updated ${result.note.metadata.title}`);

      // location.reload();
    });
  } else {
    // prepare for new note
    noteTitleDom.innerHTML = title ?? `New note on ${new Date().toLocaleString()}`;
    noteOverlayDom.innerHTML = markdownToEditableHtml(content ?? `An idea starts here...`);

    saveButtonDom.addEventListener("click", async () => {
      const createNoteBody: CreateNoteBody = {
        note: {
          metadata: {
            title: noteTitleDom.innerText,
          },
          content: editableNoteToMarkdown(noteOverlayDom),
        },
      };

      const response = await fetch(`/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createNoteBody),
      });

      const result: CreateNoteReply = await response.json();
      console.log(`[editor] created ${result.filename}`);

      window.open(`/editor.html?filename=${result.filename}`, "_self");
    });
  }
}

async function loadExistingNote(id: string) {
  const response = await fetch(`/api/notes/${encodeURIComponent(id)}`);
  const result: GetNoteReply = await response.json();

  noteTitleDom.innerHTML = result.note.metadata.title;
  return result;
}

interface UrlNoteConfig {
  filename: string | null;
  title: string | null;
  /**
   * the initial content for the note, in plaintext, not markdown.
   */
  content: string | null;
}

function getNoteConfigFromUrl(): UrlNoteConfig {
  const url = new URL(location.href);
  const searchParams = new URLSearchParams(url.search);

  const rawTitle = searchParams.get("title")?.trim();
  const rawFilename = searchParams.get("filename")?.trim();
  const rawContent = searchParams.get("content")?.trim();

  // a parameter must have length
  const title = rawTitle?.length ? rawTitle : null;
  const filename = rawFilename?.length ? rawFilename : null;
  const content = rawContent?.length ? rawContent : null;

  return {
    title,
    filename,
    content,
  };
}

loadNote();
