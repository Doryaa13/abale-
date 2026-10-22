// The one account allowed to edit the app's content at /admin.
// This only decides what the editor shows — the real gate is the Firestore rules
// (content/** is writable only by this uid), so it's fine for this to be public.
export const ADMIN_UID = 'wglHUUAQn1WzZ8YYO4acfj4Bc1S2';
