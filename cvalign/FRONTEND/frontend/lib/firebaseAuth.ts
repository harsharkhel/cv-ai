import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function isFirebaseConfigured(): boolean {
  return Object.values(firebaseConfig).every(Boolean);
}

function assertFirebaseConfig(): void {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(
      `Firebase is not configured (${missing.join(', ')}). Set VITE_FIREBASE_* in .env and restart Vite.`
    );
  }
}

function getFirebaseApp(): FirebaseApp {
  assertFirebaseConfig();
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface GoogleLoginResult {
  firebase_uid: string;
  name: string | null;
  email: string | null;
  profile_picture: string | null;
  idToken: string;
}

export function mapFirebaseAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case 'auth/popup-blocked':
      return 'Popup blocked. Please allow popups or try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in cancelled. Please try again.';
    case 'auth/invalid-api-key':
    case 'auth/configuration-not-found':
      return 'Google sign-in is misconfigured. Check Firebase web app settings.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized. Add localhost in Firebase Console → Authentication → Settings → Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Enable Google provider in Firebase Console → Authentication.';
    default:
      if (import.meta.env.DEV) {
        console.error('[Firebase Auth]', error);
      }
      return 'Google sign-in failed. Please try again or use email/password.';
  }
}

async function buildGoogleLoginResult(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  getIdToken: () => Promise<string>;
}): Promise<GoogleLoginResult> {
  const idToken = await user.getIdToken();
  return {
    firebase_uid: user.uid,
    name: user.displayName,
    email: user.email,
    profile_picture: user.photoURL,
    idToken,
  };
}

export async function loginWithGoogle(): Promise<GoogleLoginResult> {
  try {
    const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
    return buildGoogleLoginResult(result.user);
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'auth/popup-blocked') {
      await signInWithRedirect(getFirebaseAuth(), googleProvider);
      throw new Error('REDIRECTING');
    }
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function completeGoogleRedirectIfNeeded(): Promise<GoogleLoginResult | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const result = await getRedirectResult(getFirebaseAuth());
    if (!result?.user) return null;
    return buildGoogleLoginResult(result.user);
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.error('[Firebase redirect result]', error);
    }
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function logoutFirebase(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await signOut(getFirebaseAuth());
}
