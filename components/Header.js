import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { mutate } from 'swr'
import { getTrending } from '../lib/data'
import { auth, provider, firebaseInitialized, db } from '../lib/firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, query, orderBy, where, getDocs } from 'firebase/firestore'
import { getCountFromServer } from 'firebase/firestore'

export default function Header() {
  const [user, setUser] = useState(null)
  const [mobileActive, setMobileActive] = useState(false)
  const [blogCount, setBlogCount] = useState(0)
  const [podcastCount, setPodcastCount] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [theme, setTheme] = useState('light')
  const [bookmarkedCount, setBookmarkedCount] = useState(0)
  const [historyCount, setHistoryCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeMenuTab, setActiveMenuTab] = useState('main')
  const router = useRouter()

  useEffect(()=>{
    if (!firebaseInitialized()) return
    const unsub = onAuthStateChanged(auth, u => setUser(u))
    return () => unsub && unsub()
  },[])

  useEffect(()=>{
    try{
      const saved = typeof window !== 'undefined' && localStorage.getItem('wings-theme')
      if (saved) {
        setTheme(saved)
        document.documentElement.classList.toggle('theme-dark', saved === 'dark')
      } else {
        const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(prefersDark ? 'dark' : 'light')
        document.documentElement.classList.toggle('theme-dark', prefersDark)
      }
    }catch(e){/* ignore */}
  },[])

  useEffect(()=>{
    try{
      const bookmarks = JSON.parse(localStorage.getItem('wings-bookmarks') || '[]')
      const history = JSON.parse(localStorage.getItem('wings-history') || '[]')
      setBookmarkedCount(bookmarks.length)
      setHistoryCount(history.length)
    }catch(e){/* ignore */}
  },[])

  function toggleTheme(){
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    try{ localStorage.setItem('wings-theme', next) }catch(e){}
    document.documentElement.classList.toggle('theme-dark', next === 'dark')
  }

  useEffect(()=>{
    if (!firebaseInitialized()) return
    async function loadCounts(){
      try{
        try{
          const blogsColl = collection(db,'blogs')
          const blogsCountSnap = await getCountFromServer(blogsColl)
          setBlogCount(blogsCountSnap.data().count)
        }catch(e){
          const q = query(collection(db,'blogs'), orderBy('createdAt','desc'))
          const snap = await getDocs(q)
          setBlogCount(snap.size)
        }

        try{
          const podcastsColl = collection(db,'podcasts')
          const pCountSnap = await getCountFromServer(podcastsColl)
          setPodcastCount(pCountSnap.data().count)
        }catch(e){
          const q2 = query(collection(db,'podcasts'), orderBy('createdAt','desc'))
          const snap2 = await getDocs(q2)
          setPodcastCount(snap2.size)
        }

        if (auth.currentUser){
          try{
            const nColl = collection(db,'users',auth.currentUser.uid,'notifications')
            const nSnap = await getCountFromServer(nColl)
            setUnreadNotifications(nSnap.data().count)
          }catch(e){
            const nq = query(collection(db,'users',auth.currentUser.uid,'notifications'), where('read','==',false))
            const ns = await getDocs(nq)
            setUnreadNotifications(ns.size)
          }
        }
      }catch(err){ console.warn('Counts load failed', err) }
    }
    loadCounts()
  },[user])

  async function handleSignIn(){
    if (!firebaseInitialized()) { alert('Firebase not configured. See README to set .env.local'); return }
    try{ await signInWithPopup(auth, provider) }catch(e){ console.error(e) }
  }

  async function handleSignOut(){
    if (!firebaseInitialized()) { alert('Firebase not configured.'); return }
    try{ await signOut(auth) }catch(e){ console.error(e) }
  }

  function handleSearch(){
    if (!searchQuery.trim()) return
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    setShowMobileMenu(false)
    setSearchQuery('')
  }

  function prefetchHome(){
    try{ router.prefetch('/') }catch(e){}
    if (firebaseInitialized()) {
      getTrending().then(data => { try{ mutate('trending', data, { revalidate: false }) }catch(_){} })
    }
  }

  function navigateTo(path){
    router.push(path)
    setShowMobileMenu(false)
    setMobileActive(false)
  }

  return (
    <>
      <header className={`site-header gradient sticky ${mobileActive ? 'mobile-nav-active' : ''}`} style={{padding:16,display:'flex',justifyContent:'space-between',alignItems:'center',position:'relative',backdropFilter:'blur(8px)'}}>
        <button id="mobile-toggle" aria-label="Toggle menu" aria-expanded={showMobileMenu} onClick={()=>{ setMobileActive(!mobileActive); setShowMobileMenu(!showMobileMenu) }}>☰</button>

        <nav className="site-header-nav" role="navigation" aria-label="Primary navigation" style={{display:'flex',gap:18,alignItems:'center'}}>
          <Link href="/" aria-label="Go to Home" className="nav-link" style={{display:'inline-flex',alignItems:'center',gap:8}} onMouseEnter={prefetchHome} onFocus={prefetchHome}>
            <span>Home</span>
          </Link>

          <Link href="/blogs" aria-label="Go to Blog" className="nav-link" style={{display:'inline-flex',alignItems:'center',gap:8}}>
            <img src="/icons/blog.svg" alt="Blog icon" width="18" height="18" />
            <span>Blog</span>
            <span className={`badge ${blogCount ? 'updated animate-pulse' : ''}`} aria-hidden>{blogCount}</span>
          </Link>

          <Link href="/podcasts" aria-label="Go to Podcast" className="nav-link" style={{display:'inline-flex',alignItems:'center',gap:8}}>
            <img src="/icons/podcast.svg" alt="Podcast icon" width="18" height="18" />
            <span>Podcast</span>
            <span className={`badge ${podcastCount ? 'updated animate-pulse' : ''}`} aria-hidden>{podcastCount}</span>
          </Link>

          <Link href="/notifications" aria-label="Go to Notifications" className="nav-link" style={{display:'inline-flex',alignItems:'center',gap:8}}>
            <img src="/icons/profile.svg" alt="Notifications" width="18" height="18" />
            <span>Notifications</span>
            <span className={`badge ${unreadNotifications ? 'updated animate-bounce' : ''}`} aria-hidden>{unreadNotifications}</span>
          </Link>

          <Link href="/profile" aria-label="Go to Profile" className="nav-link" style={{display:'inline-flex',alignItems:'center',gap:8}}>
            <img src="/icons/profile.svg" alt="Profile icon" width="18" height="18" />
            <span>Profile</span>
          </Link>
        </nav>

        <div className="site-header-right" style={{display:'flex',alignItems:'center',gap:12,marginLeft:12}}>
          <button aria-label="Toggle theme" onClick={toggleTheme} className={`theme-toggle ${theme === 'dark' ? 'is-dark' : ''}`}>
            <span className="toggle-sun">☀️</span>
            <span className="toggle-moon">🌙</span>
          </button>
          {user ? (
            <>
              <span style={{fontSize:12,color:'var(--muted)'}}>{user.displayName}</span>
              <button onClick={handleSignOut} style={{marginLeft:8}} aria-label="Sign out" className="btn btn-ghost">Sign out</button>
            </>
          ) : (
            <button onClick={handleSignIn} aria-label="Sign in with Google" className="sign-in-pill">Sign in</button>
          )}

          <div className="brand center" style={{marginLeft:12}}>
            <Link href="/" className="logo">Wings Media</Link>
          </div>
        </div>
      </header>

      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={()=>{ setShowMobileMenu(false); setMobileActive(false) }}>
        </div>
      )}

      <div className={`mobile-menu ${showMobileMenu ? 'active' : ''}`} style={{display: showMobileMenu ? 'block' : 'none'}}>
        {/* Main Menu */}
        {activeMenuTab === 'main' && (
          <div className="menu-section">
            <div className="menu-header">
              <h3>Menu</h3>
              <button className="menu-close" onClick={()=>{ setShowMobileMenu(false); setMobileActive(false) }}>✕</button>
            </div>

            {/* User Profile Section */}
            {user ? (
              <div className="menu-user-section">
                <div className="user-info">
                  <img src={user.photoURL} alt="User avatar" className="user-avatar" />
                  <div className="user-details">
                    <div className="user-name">{user.displayName}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
              </div>
            ) : (
              <button className="menu-item sign-in-item" onClick={handleSignIn}>
                <span className="menu-icon">🔐</span>
                <span>Sign In with Google</span>
              </button>
            )}

            {/* Search Section */}
            <div className="menu-search">
              <input
                type="text"
                placeholder="Search blogs & podcasts..."
                value={searchQuery}
                onChange={(e)=>setSearchQuery(e.target.value)}
                onKeyPress={(e)=>e.key==='Enter' && handleSearch()}
                className="search-input"
              />
              <button onClick={handleSearch} className="search-btn">🔍</button>
            </div>

            {/* Quick Navigation */}
            <div className="menu-divider">Quick Links</div>

            <button className="menu-item" onClick={()=>navigateTo('/')}>
              <span className="menu-icon">🏠</span>
              <span>Home</span>
            </button>

            <button className="menu-item" onClick={()=>navigateTo('/blogs')}>
              <span className="menu-icon">📚</span>
              <span>All Blogs</span>
              <span className="menu-badge">{blogCount}</span>
            </button>

            <button className="menu-item" onClick={()=>navigateTo('/podcasts')}>
              <span className="menu-icon">🎙️</span>
              <span>All Podcasts</span>
              <span className="menu-badge">{podcastCount}</span>
            </button>

            <button className="menu-item" onClick={()=>navigateTo('/notifications')}>
              <span className="menu-icon">🔔</span>
              <span>Notifications</span>
              {unreadNotifications > 0 && <span className="menu-badge">{unreadNotifications}</span>}
            </button>

            {user && (
              <button className="menu-item" onClick={()=>navigateTo('/profile')}>
                <span className="menu-icon">👤</span>
                <span>My Profile</span>
              </button>
            )}

            {/* Browse & Filter */}
            <div className="menu-divider">Browse</div>

            <button className="menu-item" onClick={()=>setActiveMenuTab('categories')}>
              <span className="menu-icon">📂</span>
              <span>Categories</span>
              <span className="menu-arrow">→</span>
            </button>

            {user && (
              <>
                <button className="menu-item" onClick={()=>navigateTo('/bookmarks')}>
                  <span className="menu-icon">⭐</span>
                  <span>Saved Bookmarks</span>
                  <span className="menu-badge">{bookmarkedCount}</span>
                </button>

                <button className="menu-item" onClick={()=>navigateTo('/history')}>
                  <span className="menu-icon">📜</span>
                  <span>View History</span>
                  <span className="menu-badge">{historyCount}</span>
                </button>
              </>
            )}

            {/* Settings & Support */}
            <div className="menu-divider">Settings</div>

            <button className="menu-item" onClick={()=>setActiveMenuTab('settings')}>
              <span className="menu-icon">⚙️</span>
              <span>Settings</span>
              <span className="menu-arrow">→</span>
            </button>

            <button className="menu-item" onClick={()=>setActiveMenuTab('help')}>
              <span className="menu-icon">❓</span>
              <span>Help & Feedback</span>
              <span className="menu-arrow">→</span>
            </button>

            {user && (
              <button className="menu-item menu-logout" onClick={handleSignOut}>
                <span className="menu-icon">🚪</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeMenuTab === 'categories' && (
          <div className="menu-section">
            <div className="menu-header">
              <button className="menu-back" onClick={()=>setActiveMenuTab('main')}>← Back</button>
              <h3>Categories</h3>
            </div>

            <button className="menu-item" onClick={()=>{ navigateTo('/blogs?category=trending'); setActiveMenuTab('main'); }}>
              <span className="menu-icon">🔥</span>
              <span>Trending</span>
            </button>

            <button className="menu-item" onClick={()=>{ navigateTo('/blogs?category=latest'); setActiveMenuTab('main'); }}>
              <span className="menu-icon">✨</span>
              <span>Latest</span>
            </button>

            <button className="menu-item" onClick={()=>{ navigateTo('/blogs?category=popular'); setActiveMenuTab('main'); }}>
              <span className="menu-icon">⭐</span>
              <span>Popular</span>
            </button>

            <button className="menu-item" onClick={()=>{ navigateTo('/blogs?category=technology'); setActiveMenuTab('main'); }}>
              <span className="menu-icon">💻</span>
              <span>Technology</span>
            </button>

            <button className="menu-item" onClick={()=>{ navigateTo('/blogs?category=lifestyle'); setActiveMenuTab('main'); }}>
              <span className="menu-icon">🌟</span>
              <span>Lifestyle</span>
            </button>

            <button className="menu-item" onClick={()=>{ navigateTo('/blogs?category=business'); setActiveMenuTab('main'); }}>
              <span className="menu-icon">💼</span>
              <span>Business</span>
            </button>
          </div>
        )}

        {/* Settings Tab */}
        {activeMenuTab === 'settings' && (
          <div className="menu-section">
            <div className="menu-header">
              <button className="menu-back" onClick={()=>setActiveMenuTab('main')}>← Back</button>
              <h3>Settings</h3>
            </div>

            <div className="settings-item">
              <span className="settings-label">Dark Mode</span>
              <button className="toggle-switch" onClick={toggleTheme}>
                {theme === 'dark' ? '🌙 On' : '☀️ Off'}
              </button>
            </div>

            <div className="menu-divider">Preferences</div>

            <button className="menu-item" onClick={()=>navigateTo('/settings')}>
              <span className="menu-icon">🔔</span>
              <span>Notifications</span>
            </button>

            <button className="menu-item" onClick={()=>navigateTo('/settings')}>
              <span className="menu-icon">🌐</span>
              <span>Language & Region</span>
            </button>

            <button className="menu-item" onClick={()=>navigateTo('/settings')}>
              <span className="menu-icon">🔒</span>
              <span>Privacy & Security</span>
            </button>
          </div>
        )}

        {/* Help Tab */}
        {activeMenuTab === 'help' && (
          <div className="menu-section">
            <div className="menu-header">
              <button className="menu-back" onClick={()=>setActiveMenuTab('main')}>← Back</button>
              <h3>Help & Feedback</h3>
            </div>

            <button className="menu-item" onClick={()=>navigateTo('/help')}>
              <span className="menu-icon">❓</span>
              <span>FAQs</span>
            </button>

            <button className="menu-item" onClick={()=>navigateTo('/help')}>
              <span className="menu-icon">📧</span>
              <span>Contact Support</span>
            </button>

            <button className="menu-item" onClick={()=>navigateTo('/help')}>
              <span className="menu-icon">💬</span>
              <span>Send Feedback</span>
            </button>

            <button className="menu-item" onClick={()=>navigateTo('/help')}>
              <span className="menu-icon">🐛</span>
              <span>Report Issue</span>
            </button>

            <button className="menu-item" onClick={()=>navigateTo('/help')}>
              <span className="menu-icon">📱</span>
              <span>About App</span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 29;
          animation: fadeIn 200ms ease;
        }

        .mobile-menu {
          position: fixed;
          left: 0;
          top: 0;
          width: 280px;
          height: 100vh;
          background: var(--bg);
          overflow-y: auto;
          z-index: 30;
          transform: translateX(-100%);
          transition: transform 300ms ease;
          box-shadow: 4px 0 16px rgba(0, 0, 0, 0.1);
          display: none;
        }

        @media (max-width: 700px) {
          .mobile-menu {
            display: block;
          }
        }

        .theme-dark .mobile-menu {
          box-shadow: 4px 0 16px rgba(0, 0, 0, 0.3);
        }

        .mobile-menu.active {
          transform: translateX(0);
        }

        .menu-section {
          padding: 16px 0;
        }

        .menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .theme-dark .menu-header {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .menu-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }

        .menu-close {
          background: transparent;
          border: 0;
          font-size: 20px;
          cursor: pointer;
          color: var(--text);
          padding: 4px;
        }

        .menu-back {
          background: transparent;
          border: 0;
          color: var(--brand);
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          padding: 0;
        }

        .menu-user-section {
          padding: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .theme-dark .menu-user-section {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .user-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text);
        }

        .user-email {
          font-size: 12px;
          color: var(--muted);
        }

        .menu-search {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .theme-dark .menu-search {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .search-input {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
        }

        .theme-dark .search-input {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
        }

        .search-input::placeholder {
          color: var(--muted);
        }

        .search-btn {
          background: linear-gradient(90deg, #60a5fa, #7c3aed);
          color: white;
          border: 0;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        .menu-divider {
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border: 0;
          background: transparent;
          color: var(--text);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 150ms ease;
          border-left: 3px solid transparent;
        }

        .menu-item:hover {
          background: rgba(0, 0, 0, 0.04);
          border-left-color: var(--brand);
        }

        .theme-dark .menu-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .menu-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }

        .menu-badge {
          margin-left: auto;
          background: #ef4444;
          color: white;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 999px;
          font-weight: 700;
        }

        .menu-arrow {
          margin-left: auto;
          color: var(--muted);
        }

        .sign-in-item {
          margin: 12px 16px;
          background: linear-gradient(90deg, #60a5fa, #7c3aed);
          color: white;
          border-radius: 8px;
          padding: 12px 16px;
          border-left: 0;
        }

        .sign-in-item:hover {
          opacity: 0.9;
          background: linear-gradient(90deg, #60a5fa, #7c3aed);
        }

        .menu-logout {
          color: #ef4444;
          margin-top: 12px;
        }

        .menu-logout:hover {
          background: rgba(239, 68, 68, 0.08);
          border-left-color: #ef4444;
        }

        .settings-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .theme-dark .settings-item {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .settings-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
        }

        .toggle-switch {
          background: rgba(0, 0, 0, 0.06);
          border: 0;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          cursor: pointer;
          transition: all 150ms ease;
        }

        .theme-dark .toggle-switch {
          background: rgba(255, 255, 255, 0.06);
        }

        .toggle-switch:hover {
          background: rgba(0, 0, 0, 0.08);
        }

        .theme-dark .toggle-switch:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (min-width: 701px) {
          .mobile-menu,
          .mobile-menu-overlay {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
