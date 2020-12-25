import type { RouteHandlerMethod } from "fastify";
import { getConfig } from "../config";
import { getCurrentId } from "../lib/id";
import { readNote, writeNote } from "../lib/note-file-io";
import { Note, parseNote } from "../lib/parse-note";
import { runShell } from "../lib/run-shell";
import { stringifyNote } from "../lib/stringify-note";

export interface HandleGetNote {
  Params: {
    id: string;
  };
  Reply: GetNoteReply;
}

export interface GetNoteReply {
  note: Note;
  incomingConnections: IncomingConnection[];
}

export interface IncomingConnection {
  filename: string;
  title: string;
  score: number;
}

export const handleGetNote: RouteHandlerMethod<any, any, any, HandleGetNote> = async (request, reply) => {
  const params = request.params;
  const id = params.id;

  const incomingConnections = getIncomingConnections(id);
  const note = readNote(`${id}.md`).then((result) => parseNote(result));

  return {
    note: await note,
    incomingConnections: await incomingConnections,
  };
};

export interface HandleCreateNote {
  Body: CreateNoteBody;
  Reply: CreateNoteReply;
}

export interface CreateNoteBody {
  note: Note;
}

export interface CreateNoteReply {
  filename: string;
  note: Note;
}

export const handleCreateNote: RouteHandlerMethod<any, any, any, HandleCreateNote> = async (request, reply) => {
  const draftNote = request.body.note;
  const rawMarkdown = stringifyNote(draftNote);
  const id = getCurrentId();
  const filename = `${id}.md`;

  await writeNote(filename, rawMarkdown);
  const note = parseNote(rawMarkdown); // re-parse it on server side to be guard against client-side errors

  return {
    filename,
    note,
  };
};

export interface HandleUpdateNote {
  Params: {
    id: string;
  };
  Body: UpdateNoteBody;
  Reply: UpdateNoteReply;
}

export interface UpdateNoteBody {
  note: Note;
}

export interface UpdateNoteReply {
  filename: string;
  note: Note;
}

export const handleUpdateNote: RouteHandlerMethod<any, any, any, HandleUpdateNote> = async (request, reply) => {
  const params = request.params;
  const id = params.id;
  const filename = `${id}.md`;
  const draftNote = request.body.note;
  const rawMarkdown = stringifyNote(draftNote);

  await writeNote(filename, rawMarkdown);
  const note = parseNote(rawMarkdown);

  return {
    filename,
    note,
  };
};

async function getIncomingConnections(id: string): Promise<IncomingConnection[]> {
  const config = await getConfig();

  const { error, stdout, stderr } = await runShell(`rg "\(${id}\)" --count-matches`, { cwd: config.notesDir });

  if (error) {
    if (error.code === 1) {
      return [];
    } else {
      throw stderr;
    }
  } else if (!stdout.length) {
    return [];
  } else {
    const lines = stdout.trim().split("\n");
    const searchResultItems = lines
      .map((line) => line.split(":") as [filename: string, count: string])
      .map((line) => ({ filename: line[0], score: parseInt(line[1]) }));

    // open each note to parse its title
    const notesAsync = searchResultItems.map(async (item) => {
      const markdown = await readNote(item.filename);
      const parseResult = parseNote(markdown);

      return {
        filename: item.filename,
        title: parseResult.metadata.title,
        score: item.score,
      };
    });

    const notes: IncomingConnection[] = await Promise.all(notesAsync);
    const sortedNotes = notes
      .sort((a, b) => a.title.localeCompare(b.title)) // sort title first to result can remain the same
      .sort((a, b) => b.score - a.score);

    return sortedNotes;
  }
}
