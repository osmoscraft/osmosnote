import type {
  CreateNoteBody,
  CreateNoteReply,
  GetNoteReply,
  UpdateNoteBody,
  UpdateNoteReply,
} from "@system-two/server/src/routes/note";
import "./components/command-bar/command-bar.component";
import type { CommandBarComponent } from "./components/command-bar/command-bar.component";
import "./components/content-host/content-host.component";
import type { ContentHostComponent } from "./components/content-host/content-host.component";
import "./components/search-box/search-box.component";
import type { SearchBoxComponent } from "./components/search-box/search-box.component";
import "./components/status-bar/status-bar.component";
import { sendToClipboard } from "./lib/clipboard";
import { restoreRange, saveRange } from "./lib/curosr";
import { filenameToId } from "./lib/id";
import { getNoteConfigFromUrl } from "./lib/url";

const noteTitleDom = document.getElementById("note-title") as HTMLElement;
const saveButtonDom = document.getElementById("save") as HTMLButtonElement;

const contentHost = document.querySelector("s2-content-host") as ContentHostComponent;
const searchBox = document.querySelector("s2-search-box") as SearchBoxComponent;
const commandBar = document.querySelector("s2-command-bar") as CommandBarComponent;

/**
 * TODO add a headless command manager
 * - save
 * - link
 * - leader key detection
 */

async function loadNote() {
  const { filename, title, content } = getNoteConfigFromUrl();

  if (filename) {
    // load existing note
    const id = filenameToId(filename);
    const result = await loadExistingNote(id);
    contentHost.loadMarkdown(result.note.content);

    commandBar.addEventListener("command-bar:did-cancel", () => {
      restoreRange();
    });

    commandBar.addEventListener("command-bar:did-execute", () => {
      restoreRange();
    });

    searchBox.addEventListener("search-box:did-select-link", (event) => {
      sendToClipboard(event.detail.selectedLinkMarkdown);
      restoreRange();
    });

    contentHost.addEventListener("content-host:start-modal-search", () => {
      saveRange();
      searchBox.startSearch();
      commandBar.enterCommandMode();
    });

    // saveButtonDom.addEventListener("click", async () => {
    //   // save changes to note
    //   const updateNoteBody: UpdateNoteBody = {
    //     note: {
    //       metadata: {
    //         title: noteTitleDom.innerText,
    //       },
    //       content: contentHost.getMarkdown(),
    //     },
    //   };

    //   const response = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
    //     method: "PUT",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(updateNoteBody),
    //   });
    //   const result: UpdateNoteReply = await response.json();

    //   console.log(`[editor] updated ${result.note.metadata.title}`);

    //   // location.reload();
    // });
  } else {
    // prepare for new note
    noteTitleDom.innerHTML = title ?? `New note on ${new Date().toLocaleString()}`;
    contentHost.loadMarkdown(content ?? `An idea starts here...`);

    saveButtonDom.addEventListener("click", async () => {
      const createNoteBody: CreateNoteBody = {
        note: {
          metadata: {
            title: noteTitleDom.innerText,
          },
          content: contentHost.getMarkdown(),
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

loadNote();
