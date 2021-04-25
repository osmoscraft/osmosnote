import { getRepoMetadata } from "../lib/repo-metadata";
import { createHandler } from "../lib/create-handler";
import { filenameToId } from "../lib/filename-to-id";
import { readNote } from "../lib/note-file-io";
import { parseNote } from "../lib/parse-note";
import { runShell } from "../lib/run-shell";

export interface GetIncomingLinksInput {
  id: string;
}

export interface GetIncomingLinksOuput {
  incomingLinks: IncomingLink[];
}

export interface IncomingLink {
  id: string;
  title: string;
  score: number;
  tags: string[];
}

export const handleGetIncomingLinks = createHandler<GetIncomingLinksOuput, GetIncomingLinksInput>(async (input) => {
  const id = input.id;
  const links = await getIncomingLinks(id);

  return {
    incomingLinks: links,
  };
});

async function getIncomingLinks(id: string): Promise<IncomingLink[]> {
  const config = await getRepoMetadata();

  const { error, stdout, stderr } = await runShell(`rg "\(${id}\)" --count-matches`, { cwd: config.repoDir });

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
        id: filenameToId(item.filename),
        title: parseResult.metadata.title,
        score: item.score,
        tags: parseResult.metadata.tags,
      };
    });

    const notes: IncomingLink[] = await Promise.all(notesAsync);
    const sortedNotes = notes
      .sort((a, b) => a.title.localeCompare(b.title)) // sort title first to result can remain the same
      .sort((a, b) => b.score - a.score);

    return sortedNotes;
  }
}
