import { useEffect, useState } from 'react'
import { auth, db, firebaseInitialized } from '../lib/firebase'
import { collection, query, where, getCountFromServer } from 'firebase/firestore'

export default function Profile(){
  const user = auth?.currentUser
  const [blogsCount,setBlogsCount] = useState(0)
  const [podcastsCount,setPodcastsCount] = useState(0)
  const [followers,setFollowers] = useState(12)
  const [activityLevel,setActivityLevel] = useState(62)

  useEffect(()=>{
    async function counts(){
      if (!firebaseInitialized()) return
      const bq = query(collection(db,'blogs'), where('author','==', user?.displayName || ''))
      const pq = query(collection(db,'podcasts'), where('author','==', user?.displayName || ''))
      try{
        const bCount = await getCountFromServer(bq)
        const pCount = await getCountFromServer(pq)
        setBlogsCount(bCount.data().count)
        setPodcastsCount(pCount.data().count)
      }catch(e){
        // fallback
      }
    }
    if (user) counts()
  },[user])

  if (!user) {
    return (
      <div className="profile-sign-in-wrapper">
        <div className="profile-sign-in-content">
          <div style={{fontSize:'3rem', marginBottom:'16px'}}>👤</div>
          <h2>Profile</h2>
          <p>Sign in to your account to view your profile and manage your content</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="profile-dashboard">
        <div className="profile-header">
          <div className="cover" />
          <img src={user.photoURL} alt="avatar" className="avatar avatar-lg" />
          <div className="profile-name">{user.displayName}</div>
          <div className="profile-email">{user.email}</div>
        </div>

        <div className="profile-stats-grid">
          <div className="stat-card">
            <div className="stat-num">{blogsCount}</div>
            <div className="stat-label">Blogs Published</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{podcastsCount}</div>
            <div className="stat-label">Podcasts Uploaded</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{followers}</div>
            <div className="stat-label">Followers</div>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card engagement-card">
            <h3>Engagement</h3>
            <div className="engage-row">
              <div className="engage-label">Activity Level</div>
              <div className="progress-wrapper">
                <div className="progress">
                  <div className="progress-fill" style={{width: activityLevel + '%'}}></div>
                </div>
                <span className="progress-label">{activityLevel}%</span>
              </div>
            </div>
            <div className="engage-row">
              <div className="engage-label">Profile Completion</div>
              <div className="progress-wrapper">
                <div className="progress">
                  <div className="progress-fill" style={{width: '86%'}}></div>
                </div>
                <span className="progress-label">86%</span>
              </div>
            </div>
          </div>

          <div className="profile-card preferences-card">
            <h3>Preferences</h3>
            <div className="preference-group">
              <label htmlFor="language-select" className="preference-label">Language</label>
              <select id="language-select" className="input" defaultValue="en">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div className="button-group">
              <button className="btn btn-ghost">Help & Support</button>
              <button className="btn btn-danger" onClick={()=>{ if (confirm('Sign out?')) auth.signOut() }}>Logout</button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-sign-in-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 20px;
        }

        .profile-sign-in-content {
          text-align: center;
          color: var(--muted);
        }

        .profile-sign-in-content h2 {
          color: var(--text);
          margin: 0 0 12px 0;
          font-size: 28px;
        }

        .profile-sign-in-content p {
          margin: 0;
          font-size: 14px;
        }

        .profile-dashboard {
          max-width: 1000px;
          margin: 0 auto;
        }

        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 40px;
        }

        .cover {
          width: 100%;
          height: 160px;
          background: linear-gradient(135deg, #60a5fa 0%, #7c3aed 100%);
          border-radius: 16px;
          margin-bottom: -60px;
          position: relative;
          z-index: 1;
        }

        .avatar-lg {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid var(--bg);
          object-fit: cover;
          position: relative;
          z-index: 2;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
        }

        .theme-dark .avatar-lg {
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }

        .profile-name {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin-top: 16px;
        }

        .profile-email {
          color: var(--muted);
          font-size: 14px;
          margin-top: 4px;
        }

        .profile-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }

        .stat-card {
          padding: 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.08), rgba(124, 58, 237, 0.06));
          border: 1px solid rgba(96, 165, 250, 0.12);
          text-align: center;
          transition: all 200ms ease;
        }

        .theme-dark .stat-card {
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.12), rgba(124, 58, 237, 0.1));
          border-color: rgba(96, 165, 250, 0.2);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
        }

        .theme-dark .stat-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .stat-num {
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: var(--muted);
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .profile-card {
          padding: 24px;
          border-radius: 12px;
          background: var(--bg);
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
        }

        .theme-dark .profile-card {
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
        }

        .profile-card h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .engage-row {
          margin-bottom: 20px;
        }

        .engage-row:last-child {
          margin-bottom: 0;
        }

        .engage-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
          display: block;
        }

        .progress-wrapper {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .progress {
          flex: 1;
          height: 8px;
          background: rgba(0, 0, 0, 0.06);
          border-radius: 999px;
          overflow: hidden;
        }

        .theme-dark .progress {
          background: rgba(255, 255, 255, 0.06);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #60a5fa, #7c3aed);
          transition: width 300ms ease;
        }

        .progress-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          min-width: 40px;
          text-align: right;
        }

        .preference-group {
          margin-bottom: 20px;
        }

        .preference-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }

        .input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: var(--bg);
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
        }

        .theme-dark .input {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text);
        }

        .input::placeholder {
          color: var(--muted);
        }

        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          border: 0;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 200ms ease;
        }

        .btn-ghost {
          flex: 1;
          background: transparent;
          color: var(--brand);
          border: 1px solid rgba(37, 99, 235, 0.12);
        }

        .theme-dark .btn-ghost {
          border-color: rgba(96, 165, 250, 0.2);
        }

        .btn-ghost:hover {
          background: rgba(37, 99, 235, 0.04);
          border-color: rgba(37, 99, 235, 0.25);
        }

        .theme-dark .btn-ghost:hover {
          background: rgba(96, 165, 250, 0.08);
        }

        .btn-danger {
          flex: 1;
          background: linear-gradient(90deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 6px 18px rgba(239, 68, 68, 0.12);
        }

        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(239, 68, 68, 0.18);
        }

        @media (max-width: 768px) {
          .profile-stats-grid {
            grid-template-columns: 1fr;
          }

          .profile-grid {
            grid-template-columns: 1fr;
          }

          .button-group {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
