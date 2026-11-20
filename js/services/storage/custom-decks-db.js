/** Mazos creados por el usuario, guardados en IndexedDB. */

const DB_NAME = 'DiloYaDB';
const DB_VERSION = 1;
const STORE_NAME = 'decks';

let dbPromise = null;

function openDB() {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function withStore(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = fn(transaction.objectStore(STORE_NAME));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getCustomDecks() {
  const decks = await withStore('readonly', (store) => store.getAll());
  return decks.map((d) => ({ ...d, custom: true }));
}

export function saveCustomDeck(deck) {
  return withStore('readwrite', (store) => store.put(deck));
}

export function deleteCustomDeck(id) {
  return withStore('readwrite', (store) => store.delete(id));
}
