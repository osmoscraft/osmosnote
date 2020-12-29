import type { EngineModel } from "./engine-model";
import { fileTextToModelLines } from "./helpers/file-text-to-model";

export interface EngineInputEvent {
  key: KeyboardEvent["key"];
  ctrl: KeyboardEvent["ctrlKey"];
  shiftKey: KeyboardEvent["shiftKey"];
}

// THIS IS WIP. Not in use.
export class EngineController {
  private model!: EngineModel;

  initialize(fileText: string) {
    // parse content and populate model
    // this.model = fileTextToModel(fileText);
  }

  handleCursor() {}

  handleInput() {}

  undo() {}

  redo() {}
}
