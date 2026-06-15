import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Sync layer between the local device (localStorage) and the cloud account.
 *
 * Model: all user-generated progress is a single JSON blob per user, stored at
 * user_data/{uid}. The marketing profile (email/name/consent) lives at
 * profiles/{uid}.
 *
 * Belly-growth PHOTOS are intentionally NOT synced here — they go to Firebase
 * Storage in a later phase, not into the Firestore document.
 *
 * Sync model (v1): last-write-wins. The local blob is pushed up when the app is
 * hidden/closed, and on first sign-in. Good enough for a single user who is
 * usually active on one device at a time.
 */

// Keys that hold user-generated data worth syncing.
// (UI-only flags like abale_onboarding_done / abale_nav_tooltip_seen and the
//  auth session itself are deliberately excluded.)
export const SYNCED_KEYS = [
  'abale_user_name',
  'abale_user_week',
  'abale_initial_week',
  'abale_registration_date',
  'abale_last_seen_week',
  'abale_log_checks',
  'abale_tests_data',
  'abale_saved_articles',
  'abale_hospital_bag',
  'abale_reminders',
  'abale_contraction_history',
];

/** Snapshot the synced localStorage keys into a plain object. */
export const collectLocalData = () => {
  const data = {};
  SYNCED_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  });
  return data;
};

/** Write a cloud blob back into localStorage (used when cloud wins). */
export const applyCloudData = (data) => {
  if (!data) return;
  Object.entries(data).forEach(([key, value]) => {
    if (!SYNCED_KEYS.includes(key)) return;
    if (value === null || value === undefined) return;
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
};

/** Push the local snapshot up to the user's cloud document. */
export const pushToCloud = async (uid) => {
  if (!uid) return;
  await setDoc(
    doc(db, 'user_data', uid),
    { data: collectLocalData(), updatedAt: serverTimestamp() },
    { merge: true }
  );
};

/** Pull the user's cloud blob. Returns null if the document doesn't exist yet. */
export const pullFromCloud = async (uid) => {
  if (!uid) return null;
  const snap = await getDoc(doc(db, 'user_data', uid));
  if (!snap.exists()) return null;
  return snap.data()?.data || null;
};

/**
 * Create/update the marketing profile. `marketingConsent` is only written when
 * it's an explicit boolean (so a plain login never clobbers an earlier opt-in).
 */
export const upsertProfile = async (uid, { email, name, marketingConsent } = {}) => {
  if (!uid) return;
  const payload = { email: email || null, name: name || null, updatedAt: serverTimestamp() };
  if (typeof marketingConsent === 'boolean') payload.marketingConsent = marketingConsent;
  await setDoc(doc(db, 'profiles', uid), payload, { merge: true });
};
