import type {
  CreateNoteInput,
  CreateNoteOutput,
  GetMentionsInput,
  GetMentionsOuput,
  GetNoteInput,
  GetNoteOutput,
  ListNotesInput,
  ListNotesOutput,
  OutputSuccessOrError,
  SearchNoteInput,
  SearchNoteOutput,
  UpdateNoteInput,
  UpdateNoteOutput,
} from "@system-two/server";
import type { HistoryService } from "../history/history.service.js";
import type { QueryService } from "../query/query.service.js";

export class ApiService {
  constructor(private historySerivce: HistoryService, private proxyService: QueryService) {}

  async loadNote(id: string) {
    const output = await this.proxyService.query<GetNoteOutput, GetNoteInput>(`/api/get-note`, { id });

    return this.getSuccessData(output);
  }

  async listNotes() {
    const output = await this.proxyService.query<ListNotesOutput, ListNotesInput>(`/api/list-notes`, {});

    return this.getSuccessData(output);
  }

  async searchNotes(phrase: string) {
    const output = await this.proxyService.query<SearchNoteOutput, SearchNoteInput>(`/api/search-notes`, {
      phrase,
    });

    return this.getSuccessData(output);
  }

  async createNote(note: string) {
    const output = await this.proxyService.query<CreateNoteOutput, CreateNoteInput>("/api/create-note", {
      note,
    });

    return this.getSuccessData(output);
  }

  // TODO - refactor all DOM manipulation into components
  async updateNote(id: string, note: string) {
    const output = await this.proxyService.query<UpdateNoteOutput, UpdateNoteInput>(`/api/update-note`, {
      id,
      note,
    });

    return this.getSuccessData(output);
  }

  async getMentions(id: string) {
    const output = await this.proxyService.query<GetMentionsOuput, GetMentionsInput>(`/api/get-mentions`, {
      id,
    });

    return this.getSuccessData(output);
  }

  private getSuccessData<T>(output: OutputSuccessOrError<T>): T {
    if (output.error) throw output.error;

    return output.data!;
  }
}
