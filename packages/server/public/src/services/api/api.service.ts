import type {
  CreateNoteInput,
  CreateNoteOutput,
  GetMentionsInput,
  GetMentionsOuput,
  GetNoteInput,
  GetNoteOutput,
  GetRecentNotesInput,
  GetRecentNotesOutput,
  GetRecentTagsOutput,
  LookupTagsInput,
  LookupTagsOutput,
  OutputSuccessOrError,
  SearchNoteInput,
  SearchNoteOutput,
  UpdateNoteInput,
  UpdateNoteOutput,
  GetContentFromUrlInput,
  GetContentFromUrlOutput,
} from "@system-two/server";
import type { QueryService } from "../query/query.service.js";

export class ApiService {
  constructor(private proxyService: QueryService) {}

  loadNote = (id: string) => this.safeQuery<GetNoteOutput, GetNoteInput>(`/api/get-note`, { id });

  getRecentNotes = () => this.safeQuery<GetRecentNotesOutput, GetRecentNotesInput>(`/api/get-recent-notes`, {});

  getRecentTags = () => this.safeQuery<GetRecentTagsOutput, GetRecentNotesInput>(`/api/get-recent-tags`, {});

  lookupTags = (phrase: string) =>
    this.safeQuery<LookupTagsOutput, LookupTagsInput>(`/api/lookup-tags`, {
      phrase,
    });

  searchNotes = (phrase: string, tags?: string[]) =>
    this.safeQuery<SearchNoteOutput, SearchNoteInput>(`/api/search-notes`, {
      phrase,
      tags,
    });

  createNote = (note: string) =>
    this.safeQuery<CreateNoteOutput, CreateNoteInput>("/api/create-note", {
      note,
    });

  updateNote = (id: string, note: string) =>
    this.safeQuery<UpdateNoteOutput, UpdateNoteInput>(`/api/update-note`, {
      id,
      note,
    });

  getMentions = (id: string) =>
    this.safeQuery<GetMentionsOuput, GetMentionsInput>(`/api/get-mentions`, {
      id,
    });

  getContentFromUrl = (url: string) =>
    this.safeQuery<GetContentFromUrlOutput, GetContentFromUrlInput>(`/api/get-content-from-url`, {
      url,
    });

  private async safeQuery<OutputType, InputType>(path: string, input: InputType) {
    const output = await this.proxyService.query<OutputType, InputType>(path, input);

    return this.getSuccessData(output);
  }

  private getSuccessData<T>(output: OutputSuccessOrError<T>): T {
    if (output.error) throw output.error;

    return output.data!;
  }
}
