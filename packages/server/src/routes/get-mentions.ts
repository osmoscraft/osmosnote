import { getConfig } from "../config";
import { createHandler } from "../lib/create-handler";
import { readNote } from "../lib/note-file-io";
import { parseNote } from "../lib/parse-note";
import { runShell } from "../lib/run-shell";

export interface GetMentionsInput {
  id: string;
}

export interface GetMentionsOuput {
  mentions: Mention[];
}

export interface Mention {
  filename: string;
  title: string;
  score: number;
}

export const handleGetMentions = createHandler<GetMentionsOuput, GetMentionsInput>(async (input) => {
  const id = input.id;
  const mentions = await getMentions(id);

  return {
    mentions,
  };
});

async function getMentions(id: string): Promise<Mention[]> {
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

    const notes: Mention[] = await Promise.all(notesAsync);
    const sortedNotes = notes
      .sort((a, b) => a.title.localeCompare(b.title)) // sort title first to result can remain the same
      .sort((a, b) => b.score - a.score);

    return sortedNotes;
  }
}
