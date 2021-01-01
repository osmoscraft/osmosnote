import type {
  CreateNoteBody,
  CreateNoteReply,
  UpdateNoteBody,
  UpdateNoteReply,
} from "@system-two/server/src/routes/note";
import type { ProxyService } from "../proxy/proxy.service";

export class FileStorageService {
  constructor(private proxyService: ProxyService) {}

  async update(id: string, updateNoteBody: UpdateNoteBody) {
    return this.proxyService.put<UpdateNoteReply, UpdateNoteBody>(
      `/api/notes/${encodeURIComponent(id)}`,
      updateNoteBody
    );
  }

  async create(createNoteBody: CreateNoteBody) {
    return this.proxyService.post<CreateNoteReply, CreateNoteBody>(`/api/notes`, createNoteBody);
  }
}
