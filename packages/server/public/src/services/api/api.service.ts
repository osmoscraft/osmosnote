import type {
  CreateNoteInput,
  CreateNoteOutput,
  DeleteNoteInput,
  DeleteNoteOutput,
  ForcePushInput,
  ForcePushOutput,
  GetContentFromUrlInput,
  GetContentFromUrlOutput,
  GetIncomingLinksInput,
  GetIncomingLinksOuput,
  GetNoteInput,
  GetNoteOutput,
  GetRecentNotesInput,
  GetRecentNotesOutput,
  GetRecentTagsInput,
  GetRecentTagsOutput,
  GetSettingsInput,
  GetSettingsOutput,
  GetSystemInformationInput,
  GetSystemInformationOutput,
  GetVersionStatusInput,
  GetVersionStatusOutput,
  LookupTagsInput,
  LookupTagsOutput,
  OutputSuccessOrError,
  ResetLocalVersionInput,
  ResetLocalVersionOutput,
  SearchNoteInput,
  SearchNoteOutput,
  SetGitRemoteInput,
  SetGitRemoteOutput,
  SyncVersionsInput,
  SyncVersionsOutput,
  TestGitRemoteOutput,
  UpdateNoteInput,
  UpdateNoteOutput,
  TestGitRemoteInput,
} from "@osmoscraft/osmosnote";
import type { QueryService } from "../query/query.service.js";

export class ApiService {
  constructor(private queryService: QueryService) {}

  loadNote = (id: string) => this.safeQuery<GetNoteOutput, GetNoteInput>(`/api/get-note`, { id });

  forcePush = () => this.safeQuery<ForcePushOutput, ForcePushInput>(`/api/force-push`, {});

  getRecentNotes = (limit?: number) =>
    this.safeQuery<GetRecentNotesOutput, GetRecentNotesInput>(`/api/get-recent-notes`, { limit });

  getRecentTags = () => this.safeQuery<GetRecentTagsOutput, GetRecentTagsInput>(`/api/get-recent-tags`, {});

  lookupTags = (phrase: string) =>
    this.safeQuery<LookupTagsOutput, LookupTagsInput>(`/api/lookup-tags`, {
      phrase,
    });

  searchNotes = (phrase: string, tags?: string[], limit?: number) =>
    this.safeQuery<SearchNoteOutput, SearchNoteInput>(`/api/search-notes`, {
      phrase,
      tags,
      limit,
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

  deleteNote = (id: string) =>
    this.safeQuery<DeleteNoteOutput, DeleteNoteInput>(`/api/delete-note`, {
      id,
    });

  getIncomingLinks = (id: string) =>
    this.safeQuery<GetIncomingLinksOuput, GetIncomingLinksInput>(`/api/get-incoming-links`, {
      id,
    });

  getContentFromUrl = (url: string) =>
    this.safeQuery<GetContentFromUrlOutput, GetContentFromUrlInput>(`/api/get-content-from-url`, {
      url,
    });

  getSettings = () => this.safeQuery<GetSettingsOutput, GetSettingsInput>(`/api/get-settings`, {});

  getSystemInformation = () =>
    this.safeQuery<GetSystemInformationOutput, GetSystemInformationInput>(`/api/get-system-information`, {});

  getVersionStatus = () => this.safeQuery<GetVersionStatusOutput, GetVersionStatusInput>(`/api/get-version-status`, {});

  resetLocalVersion = () =>
    this.safeQuery<ResetLocalVersionOutput, ResetLocalVersionInput>(`/api/reset-local-version`, {});

  setGitRemote = (url: string) => this.safeQuery<SetGitRemoteOutput, SetGitRemoteInput>(`/api/set-git-remote`, { url });

  syncVersions = () => this.safeQuery<SyncVersionsOutput, SyncVersionsInput>(`/api/sync-versions`, {});

  testGitRemote = (remoteUrl: string) =>
    this.safeQuery<TestGitRemoteOutput, TestGitRemoteInput>(`/api/test-git-remote`, {
      remoteUrl,
    });

  private async safeQuery<OutputType, InputType>(path: string, input: InputType) {
    const output = await this.queryService.query<OutputType, InputType>(path, input);

    return this.getSuccessData(output);
  }

  private getSuccessData<T>(output: OutputSuccessOrError<T>): T {
    if (output.error) throw output.error;

    return output.data!;
  }
}
