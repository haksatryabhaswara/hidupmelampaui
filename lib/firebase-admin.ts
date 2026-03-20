// Firebase Admin SDK — runs only on the server (API routes)
//
// Add ONE of the following to your .env.local:
//
// Option A — full service account JSON (recommended):
//   FIREBASE_ADMIN_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
//
// Option B — individual fields:
//   FIREBASE_ADMIN_PROJECT_ID=hidupmelampaui
//   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@hidupmelampaui.iam.gserviceaccount.com
//   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
//
// Download the service account key from:
//   Firebase Console → Project Settings → Service accounts → Generate new private key

import type { App } from "firebase-admin/app";

let _adminApp: App | null = null;

export function getAdminApp(): App {
  if (_adminApp) return _adminApp;

  // Lazy import to avoid bundling in client-side code
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initializeApp, getApps, cert } = require("firebase-admin/app");

  const existing = getApps();
  if (existing.length > 0) {
    _adminApp = existing[0] as App;
    return _adminApp;
  }

  const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    _adminApp = initializeApp({
      credential: cert(JSON.parse(serviceAccountJson) as object),
    });
  } else {
    _adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? "hidupmelampaui",
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "YOUR_SERVICE_ACCOUNT_EMAIL",
        privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "YOUR_PRIVATE_KEY").replace(/\\n/g, "\n"),
      }),
    });
  }

  return _adminApp!;
}
