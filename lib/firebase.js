import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

let app = null
let auth = null
let provider = null
let db = null
let storage = null
let analytics = null
let configLoaded = false

async function loadAndInitializeFirebase() {
  if (configLoaded) return
  configLoaded = true

  try {
    const response = await fetch('/firebase-config.json')
    const firebaseConfig = await response.json()

    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
      console.warn('Firebase config is incomplete')
      return
    }

    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    provider = new GoogleAuthProvider()
    db = getFirestore(app)
    storage = getStorage(app, "gs://wingsmedia-db8e7.appspot.com")

    if (firebaseConfig.measurementId) {
      try {
        analytics = getAnalytics(app)
      } catch (e) {
        console.warn('Could not initialize Firebase Analytics:', e?.message || e)
      }
    }

    console.log('Firebase initialized successfully')
  } catch (e) {
    console.error('Failed to initialize Firebase:', e)
  }
}

function firebaseInitialized() {
  return !!app && !!auth && !!db && !!storage
}

// Auto-initialize on client-side
if (typeof window !== 'undefined') {
  loadAndInitializeFirebase()
}

export { app, auth, provider, db, storage, analytics, firebaseInitialized, loadAndInitializeFirebase }
