import crypto from 'crypto';
import { mkdirSync } from 'fs';
import url from 'url';
import { join } from 'path';
import sqlite from 'better-sqlite3';

const data_directory = url.fileURLToPath(new URL('./.data/', import.meta.url));

mkdirSync(data_directory, { recursive: true });

const db = sqlite(join(data_directory, 'plugin.db'));

const create_table = db.prepare(`
  CREATE TABLE IF NOT EXISTS svelte_fragments (
    hash TEXT NOT NULL UNIQUE,
    code TEXT
  );
`);

const drop_table = db.prepare(`
  DROP TABLE IF EXISTS svelte_fragments;
`);

drop_table.run();
create_table.run();

const create_index_hash = db.prepare(`
  CREATE INDEX IF NOT EXISTS idx_svelte_fragments_hash ON svelte_fragments(hash);
`);

create_index_hash.run();

const insert_fragment = db.prepare(`
  INSERT OR IGNORE INTO svelte_fragments (hash, code) VALUES (?, ?);
`);

const select_fragment = db.prepare(`
  SELECT code FROM svelte_fragments WHERE hash = ?;
`);

const moduleId = 'virtual:inline-svelte:';
const extension = '.svelte';

export function svelte(...code) {
  const fragment = code.join('');
  const hash = crypto.createHash('md5').update(fragment).digest('hex');
  const filename = hash + extension;
  const id = moduleId + filename;
  insert_fragment.run(hash, fragment)
  return import(id);
}

export function SvelteInlineCompile() {
  return {
    name: 'svelte-inline-compile',

    resolve(id) {
      if (id.startsWith(moduleId)) {
        return id;
      }
    },

    load(id) {
      if (id.startsWith(moduleId)) {
        const hash = id.replace(moduleId, '').replace(extension, '');
        const fragment = select_fragment.get(hash);
        if (fragment) {
          return fragment.code;
        }
      }
    },

    closeBundle() {
      drop_table.run();
    },
  }
}
