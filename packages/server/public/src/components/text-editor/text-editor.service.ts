import type { InputService } from "../../services/input/input.service.js";
import type { NoteService } from "../../services/note/note.service.js";

export class TextEditorService {
  constructor(private noteService: NoteService, private inputService: InputService) {}

  async init() {
    await this.noteService.init();
    this.inputService.handleEvents();
  }
}
