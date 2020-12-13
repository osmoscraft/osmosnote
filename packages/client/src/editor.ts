import type {
  CreateNoteBody,
  CreateNoteReply,
  GetNoteReply,
  UpdateNoteBody,
  UpdateNoteReply,
} from "@system-two/server/src/routes/note";
import { domToMarkdown, markdownToHtml, updateIndentation } from "./lib/codec";

const noteTitleDom = document.getElementById("note-title") as HTMLElement;
const noteContentDom = document.getElementById("note-content") as HTMLElement;
const noteOverlayDom = document.getElementById("note-overlay") as HTMLElement;
const saveButtonDom = document.getElementById("save") as HTMLButtonElement;

async function loadNote() {
  const { filename, title, content } = getNoteConfigFromUrl();

  if (filename) {
    // load existing note
    const id = filename.split(".md")[0];
    const result = await loadExistingNote(id);
    // noteContentDom.innerHTML = result.note.content;
    noteContentDom.innerHTML = markdownToHtml(result.note.content);
    noteOverlayDom.innerHTML = markdownToHtml(result.note.content);
    updateIndentation(noteContentDom);
    updateIndentation(noteOverlayDom);

    saveButtonDom.addEventListener("click", async () => {
      // save changes to note
      const updateNoteBody: UpdateNoteBody = {
        note: {
          metadata: {
            title: noteTitleDom.innerText,
          },
          content: domToMarkdown(noteOverlayDom),
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
    noteOverlayDom.innerHTML = markdownToHtml(content ?? `An idea starts here...`);

    saveButtonDom.addEventListener("click", async () => {
      const createNoteBody: CreateNoteBody = {
        note: {
          metadata: {
            title: noteTitleDom.innerText,
          },
          content: domToMarkdown(noteOverlayDom),
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
