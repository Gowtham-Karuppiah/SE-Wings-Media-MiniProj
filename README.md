# Wings Media — Next.js + Firebase Starter

This repository is a starter scaffold for Wings Media: a blog & podcast platform using Next.js and Firebase (Auth, Firestore, Storage).

Quick start

1. Copy environment variables:

   - Create a file `.env.local` at project root and populate with values from `.env.local.example`.

2. Install and run:

```powershell
npm install
npm run dev
```

3. Open http://localhost:3000

What this scaffold includes

- Firebase client in `lib/firebase.js` (uses NEXT_PUBLIC_ env vars)
- Pages: Home (`/`), Blogs (`/blogs`), Podcasts (`/podcasts`), Profile (`/profile`)
- Components: `Header`, `MediaCard`
- Basic create blog (with image upload) and podcast upload (audio upload)

Notes & next steps

- Google sign-in is implemented in the header. Use the Sign in button to authenticate via Google.
- Create/Upload forms now require authentication; they use the signed-in user's display name as the author.
- Detailed view pages exist at `/blogs/[id]` and `/podcasts/[id]`. They increment views/listens transactionally when opened.
- Add pagination, caching strategies, UI polish, and unit/E2E tests as follow-ups.

Firebase configuration and troubleshooting
--------------------------------------

This project reads Firebase client config from environment variables (Next.js `process.env`). Put your Firebase web app config into a file named `.env.local` at the repository root. Do NOT commit `.env.local`.

Required keys (create `.env.local` with these entries):

```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
# optional
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

Where to get these values:
- Open the Firebase Console → Project Settings → General → Your Apps (Web) and copy the config values for the web app.

Common causes for the "Firebase not configured" alert
- `.env.local` missing or not located in the repository root.
- You accidentally left placeholder lines (for example `your_project_id`) in `.env.local` that override the real keys. If you pasted a working config and later added example placeholders, remove the placeholder lines so only the real values remain.
- The dev server needs a restart after editing `.env.local`. Stop and re-run `npm run dev`.

Troubleshooting steps
1. Ensure `.env.local` exists and contains the required `NEXT_PUBLIC_` keys.
2. Remove any duplicate placeholder lines such as `your_project_id` or `your_api_key`.
3. Restart the dev server:

```powershell
npm run dev
```

4. Open the site in a real browser (not the server terminal) at http://localhost:3000 and check the browser console for any Firebase-related warnings.

If you still see a popup that says "Firebase not configured. See README to set .env.local", open the terminal running `npm run dev` and confirm it shows `info Loaded env from <path>/.env.local` and that no placeholders are present in that file.

Using the Firebase Emulator Suite (recommended for local dev)
- Install the Firebase CLI (only if you want local emulators):

```powershell
npm install -g firebase-tools
```

- Initialize emulators in the project (one-time):

```powershell
firebase init emulators
```

- Start emulators locally:

```powershell
firebase emulators:start
```

Then, in your client code you can connect to the emulators with the modular SDK (for example, `connectFirestoreEmulator(db, 'localhost', 8080)`) so you don't hit production and avoid network permission issues.

Security note
- Do not commit `.env.local` to version control. If you accidentally committed keys, remove them from the repo history and rotate the keys in Firebase.

Verification steps for the implemented features

Verification steps for the implemented features

1. Start the dev server: `npm run dev` and open http://localhost:3000
2. Click "Sign in" in the header and complete Google sign-in. Your display name should appear in the header.
3. Go to `/blogs` and create a blog. After saving, the blog should appear in the list with 0 views.
4. Click the blog to open `/blogs/[id]` — the view counter will increment once on page load.
5. Go to `/podcasts`, upload an audio file, then open its detail page — the `listens` counter will increment and the audio player will be available.

If you encounter permission errors, check your Firestore and Storage rules and make sure your Firebase project allows authenticated reads/writes during development.
