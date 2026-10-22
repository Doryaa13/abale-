/**
 * Belly-growth photos on this device, stored in IndexedDB.
 *
 * localStorage tops out at ~5MB for the whole app — less than a full pregnancy
 * of photos — and rewrites every photo on each change. IndexedDB has far more
 * room and stores one record per photo: key = week number, value = JPEG data URL.
 *
 * Photos stay on the device only (they aren't synced to the cloud). Older app
 * versions kept them in localStorage under LEGACY_KEY; they're moved over
 * automatically the first time anything here runs.
 */

const DB_NAME = 'abale';
const DB_VERSION = 1;
const STORE = 'belly_photos';
const LEGACY_KEY = 'abale_belly_photos';

let dbPromise = null;
const openDb = () => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            if (typeof indexedDB === 'undefined') {
                reject(new Error('IndexedDB is not available'));
                return;
            }
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = () => {
                if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        dbPromise.catch(() => { dbPromise = null; }); // allow a retry later
    }
    return dbPromise;
};

// Run `work(store)` in one transaction; resolves once it has fully committed.
const transact = async (mode, work) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const out = work(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(out);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
};

// Move photos saved by older versions (localStorage) into IndexedDB, once.
// The old copy is removed only after the new one has been written.
let migration = null;
export const migrateLegacyPhotos = () => {
    if (!migration) {
        migration = (async () => {
            const raw = localStorage.getItem(LEGACY_KEY);
            if (!raw) return;
            let legacy;
            try { legacy = JSON.parse(raw); } catch { return; }
            const entries = Object.entries(legacy || {}).filter(([, url]) => typeof url === 'string' && url);
            if (entries.length) {
                await transact('readwrite', (store) => {
                    entries.forEach(([week, url]) => store.put(url, Number(week)));
                });
            }
            localStorage.removeItem(LEGACY_KEY);
        })().catch((e) => {
            migration = null; // keep the old copy and try again next time
            throw e;
        });
    }
    return migration;
};

/** All photos as { [week]: dataUrl }. */
export const getAllPhotos = async () => {
    await migrateLegacyPhotos();
    return transact('readonly', (store) => {
        const photos = {};
        const req = store.openCursor();
        req.onsuccess = () => {
            const cursor = req.result;
            if (!cursor) return;
            photos[cursor.key] = cursor.value;
            cursor.continue();
        };
        return photos;
    });
};

export const putPhoto = async (week, dataUrl) => {
    await migrateLegacyPhotos();
    await transact('readwrite', (store) => { store.put(dataUrl, Number(week)); });
};

export const removePhoto = async (week) => {
    await migrateLegacyPhotos();
    await transact('readwrite', (store) => { store.delete(Number(week)); });
};

/** Delete every photo on this device (including a not-yet-migrated old copy). */
export const clearPhotos = async () => {
    localStorage.removeItem(LEGACY_KEY);
    await transact('readwrite', (store) => { store.clear(); });
};

/**
 * Ask the browser not to evict our storage under pressure (e.g. Safari's
 * clean-up of sites that weren't opened for a while). Best effort — browsers
 * may say no, and installed apps usually get it anyway.
 */
export const requestPersistentStorage = () => {
    try {
        navigator.storage?.persist?.().catch(() => {});
    } catch { /* not supported */ }
};
