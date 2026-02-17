import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth, firebaseInitialized } from '../lib/firebase'

export default function Settings() {
  const router = useRouter()
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('en')
  const [notifications, setNotifications] = useState({
    email: false,
    push: false,
    newBlogs: true,
    newPodcasts: true,
    comments: false
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('wings-theme')
      if (savedTheme) setTheme(savedTheme)

      const savedLang = localStorage.getItem('wings-language')
      if (savedLang) setLanguage(savedLang)

      const savedNotifs = localStorage.getItem('wings-notifications')
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs))
    } catch (e) {
      console.error('Error loading settings:', e)
    }
  }, [])

  function toggleTheme(newTheme) {
    setTheme(newTheme)
    localStorage.setItem('wings-theme', newTheme)
    document.documentElement.classList.toggle('theme-dark', newTheme === 'dark')
  }

  function handleLanguageChange(lang) {
    setLanguage(lang)
    localStorage.setItem('wings-language', lang)
  }

  function toggleNotification(key) {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    localStorage.setItem('wings-notifications', JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!firebaseInitialized()) {
    return (
      <div className="container">
        <div className="settings-empty">
          <p>Please sign in to access settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="settings-header">
        <h2>Settings</h2>
        <p className="settings-subtitle">Manage your preferences and account settings</p>
      </div>

      {saved && <div className="save-notification">✓ Settings saved</div>}

      <div className="settings-grid">
        {/* Theme Settings */}
        <div className="settings-card">
          <h3>Appearance</h3>
          <p className="card-description">Choose your preferred theme</p>

          <div className="theme-options">
            <button 
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => toggleTheme('light')}
            >
              <span className="theme-icon">☀️</span>
              <span className="theme-label">Light</span>
            </button>
            <button 
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => toggleTheme('dark')}
            >
              <span className="theme-icon">🌙</span>
              <span className="theme-label">Dark</span>
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="settings-card">
          <h3>Language & Region</h3>
          <p className="card-description">Select your language preference</p>

          <div className="select-wrapper">
            <select 
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="select-input"
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
            </select>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-card full-width">
          <h3>Notifications</h3>
          <p className="card-description">Choose how you want to be notified</p>

          <div className="notification-items">
            <div className="notification-item">
              <div className="notification-info">
                <label className="notification-label">📧 Email Notifications</label>
                <p className="notification-detail">Receive updates via email</p>
              </div>
              <button 
                className={`toggle ${notifications.email ? 'on' : 'off'}`}
                onClick={() => toggleNotification('email')}
              >
                {notifications.email ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="notification-item">
              <div className="notification-info">
                <label className="notification-label">💬 Push Notifications</label>
                <p className="notification-detail">Get browser notifications</p>
              </div>
              <button 
                className={`toggle ${notifications.push ? 'on' : 'off'}`}
                onClick={() => toggleNotification('push')}
              >
                {notifications.push ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="notification-item">
              <div className="notification-info">
                <label className="notification-label">📚 New Blogs</label>
                <p className="notification-detail">Notify when new blogs are published</p>
              </div>
              <button 
                className={`toggle ${notifications.newBlogs ? 'on' : 'off'}`}
                onClick={() => toggleNotification('newBlogs')}
              >
                {notifications.newBlogs ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="notification-item">
              <div className="notification-info">
                <label className="notification-label">🎙️ New Podcasts</label>
                <p className="notification-detail">Notify when new podcasts are uploaded</p>
              </div>
              <button 
                className={`toggle ${notifications.newPodcasts ? 'on' : 'off'}`}
                onClick={() => toggleNotification('newPodcasts')}
              >
                {notifications.newPodcasts ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="notification-item">
              <div className="notification-info">
                <label className="notification-label">💬 Comments & Replies</label>
                <p className="notification-detail">Notify when someone comments on your content</p>
              </div>
              <button 
                className={`toggle ${notifications.comments ? 'on' : 'off'}`}
                onClick={() => toggleNotification('comments')}
              >
                {notifications.comments ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="settings-card">
          <h3>Privacy & Security</h3>
          <p className="card-description">Manage your privacy settings</p>

          <button className="settings-link">🔐 Change Password</button>
          <button className="settings-link">👤 Profile Visibility</button>
          <button className="settings-link">🚫 Blocked Users</button>
        </div>
      </div>

      <style jsx>{`
        .settings-header {
          margin-bottom: 32px;
        }

        .settings-header h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
        }

        .settings-subtitle {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
        }

        .save-notification {
          padding: 12px 16px;
          background: rgba(34, 197, 94, 0.1);
          border-left: 3px solid #22c55e;
          border-radius: 6px;
          color: #22c55e;
          margin-bottom: 24px;
          font-weight: 600;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .settings-card {
          padding: 24px;
          border-radius: 12px;
          background: var(--bg);
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
        }

        .theme-dark .settings-card {
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
        }

        .settings-card h3 {
          margin: 0 0 6px 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }

        .card-description {
          margin: 0 0 20px 0;
          font-size: 13px;
          color: var(--muted);
        }

        .theme-options {
          display: flex;
          gap: 12px;
        }

        .theme-option {
          flex: 1;
          padding: 16px;
          border-radius: 10px;
          border: 2px solid rgba(0, 0, 0, 0.06);
          background: var(--bg);
          color: var(--text);
          cursor: pointer;
          transition: all 200ms ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .theme-dark .theme-option {
          border-color: rgba(255, 255, 255, 0.08);
        }

        .theme-option:hover {
          border-color: var(--brand);
          background: rgba(96, 165, 250, 0.04);
        }

        .theme-option.active {
          border-color: var(--brand);
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.08), rgba(124, 58, 237, 0.06));
        }

        .theme-icon {
          font-size: 24px;
        }

        .theme-label {
          font-weight: 600;
          font-size: 13px;
        }

        .select-wrapper {
          position: relative;
        }

        .select-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: var(--bg);
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
        }

        .theme-dark .select-input {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
        }

        .notification-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notification-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.02);
        }

        .theme-dark .notification-item {
          background: rgba(255, 255, 255, 0.04);
        }

        .notification-info {
          flex: 1;
        }

        .notification-label {
          display: block;
          font-weight: 600;
          font-size: 14px;
          color: var(--text);
          margin-bottom: 4px;
        }

        .notification-detail {
          margin: 0;
          font-size: 12px;
          color: var(--muted);
        }

        .toggle {
          background: rgba(0, 0, 0, 0.06);
          border: 0;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          color: var(--muted);
          cursor: pointer;
          transition: all 150ms ease;
        }

        .theme-dark .toggle {
          background: rgba(255, 255, 255, 0.06);
        }

        .toggle.on {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .settings-link {
          display: block;
          width: 100%;
          padding: 12px 0;
          border: 0;
          background: transparent;
          color: var(--brand);
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          text-align: left;
          transition: all 150ms ease;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .theme-dark .settings-link {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .settings-link:last-child {
          border-bottom: 0;
        }

        .settings-link:hover {
          padding-left: 8px;
          opacity: 0.8;
        }

        .settings-empty {
          padding: 60px 20px;
          text-align: center;
          color: var(--muted);
        }

        .full-width {
          grid-column: 1 / -1;
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }

          .full-width {
            grid-column: 1;
          }

          .theme-options {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
