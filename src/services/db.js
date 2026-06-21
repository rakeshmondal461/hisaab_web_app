/**
 * db.js — Promise-based IndexedDB service for HiSaab.
 *
 * Uses a single "keyval" object store so the API stays identical
 * to the old localStorage wrapper (get/set/remove/clear), just async.
 *
 * DB name  : hisaab_db
 * Version  : 1
 * Store    : keyval  (out-of-line keys)
 */

const DB_NAME = 'hisaab_db';
const DB_VERSION = 1;
const STORE = 'keyval';

/** Opens (or re-uses) the database connection. */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE);
      }
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror  = (e) => reject(e.target.error);
  });
}

export const db = {
  /** Read a value. Returns `fallback` when the key is missing or on error. */
  async get(key, fallback = null) {
    try {
      const database = await openDB();
      return new Promise((resolve) => {
        const tx  = database.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(key);
        req.onsuccess = () => resolve(req.result !== undefined ? req.result : fallback);
        req.onerror   = () => resolve(fallback);
      });
    } catch {
      return fallback;
    }
  },

  /** Write a value. Fire-and-forget; silently swallows errors. */
  async set(key, value) {
    try {
      const database = await openDB();
      return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror    = () => reject(tx.error);
      });
    } catch {
      // Storage quota exceeded or private-browsing restriction — fail silently.
    }
  },

  /** Delete a single key. */
  async remove(key) {
    try {
      const database = await openDB();
      return new Promise((resolve) => {
        const tx = database.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror    = () => resolve();
      });
    } catch {}
  },

  /** Wipe every entry in the store (used by "Clear All Data"). */
  async clear() {
    try {
      const database = await openDB();
      return new Promise((resolve) => {
        const tx = database.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror    = () => resolve();
      });
    } catch {}
  },
};
