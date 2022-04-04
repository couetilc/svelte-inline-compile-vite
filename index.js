import crypto from 'crypto';
import fs from 'fs-extra';
import url from 'url';
import { join } from 'path';
import sqlite from 'better-sqlite3';

const data_directory = url.fileURLToPath(new URL('./.data/', import.meta.url));
const files_directory = join(data_directory, 'files');

fs.mkdirpSync(data_directory);
fs.mkdirpSync(files_directory);

const db = sqlite(join(data_directory, 'plugin.db'));

const create_table = db.prepare(`
  CREATE TABLE IF NOT EXISTS svelte_fragments (
    path TEXT NOT NULL UNIQUE,
    hash TEXT NOT NULL UNIQUE
  );
`);

create_table.run();

const delete_table = db.prepare(`
  DELETE FROM svelte_fragments WHERE true;
`);

const create_index_hash = db.prepare(`
  CREATE INDEX IF NOT EXISTS idx_svelte_fragments_hash ON svelte_fragments(hash);
`);

create_index_hash.run();

const insert_fragment = db.prepare(`
  INSERT OR IGNORE INTO svelte_fragments (path, hash) VALUES (?, ?);
`);

const select_fragment = db.prepare(`
  SELECT path FROM svelte_fragments WHERE hash = ?;
`);

const moduleId = 'virtual:inline-svelte:';
const extension = '.svelte';

export function svelte(...code) {
  const fragment = code.join('');
  const hash = crypto.createHash('md5').update(fragment).digest('hex');
  const filename = hash + extension;
  const path = join(files_directory, filename);
  const id = moduleId + filename;
  fs.writeFileSync(path, fragment);
  insert_fragment.run(path, hash)
  return import(id);
}

export function SvelteInlineCompile() {
  return {
    name: 'svelte-inline-compile',

    resolveId(id) {
      if (id.startsWith(moduleId)) {
        const hash = id.replace(moduleId, '').replace(extension, '');
        const fragment = select_fragment.get(hash);
        if (fragment) {
          return fragment.path;
        }
      }
    },

    closeBundle() {
      fs.emptyDirSync(files_directory);
      delete_table.run();
    },
  }
}
