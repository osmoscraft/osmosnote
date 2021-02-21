import type {
  GetMentionsInput,
  GetMentionsOuput,
  GetNoteInput,
  GetNoteOutput,
  ListNotesInput,
  ListNotesOutput,
  SearchNoteInput,
  SearchNoteOutput,
  UpdateNoteInput,
  UpdateNoteOutput,
  OutputSuccessOrError,
} from "@system-two/server";
import { getPortableText } from "../../components/text-editor/helpers/line/line-query.js";
import type { HistoryService } from "../history/history.service.js";
import type { QueryService } from "../query/query.service.js";

export class ApiService {
  constructor(private historySerivce: HistoryService, private proxyService: QueryService) {}

  // TODO - refactor all DOM manipulation into components

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

  async updateNote(id: string) {
    const host = document.querySelector("#content-host") as HTMLElement;
    const lines = [...host.querySelectorAll("[data-line]")] as HTMLElement[];
    const note = getPortableText(lines);

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
