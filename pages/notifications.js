import { useEffect, useState } from 'react'
import { auth, db, firebaseInitialized } from '../lib/firebase'
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore'

export default function Notifications(){
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      if (!firebaseInitialized()) return
      if (!auth?.currentUser) return
      setLoading(true)
      const q = query(collection(db,'users',auth?.currentUser?.uid,'notifications'), orderBy('createdAt','desc'))
      const snap = await getDocs(q)
      setNotes(snap.docs.map(d=>({id:d.id,...d.data()})))
      setLoading(false)
    }
    load()
  },[])

  async function markAllRead(){
    for (const n of notes){
      if (n.read) continue
      const ref = doc(db,'users',auth?.currentUser?.uid,'notifications',n.id)
      await updateDoc(ref,{read:true})
    }
    setNotes(prev => prev.map(n=>({...n,read:true})))
  }

  if (!auth?.currentUser) {
    return (
      <div className="notifications-empty">
        <div style={{fontSize:'2rem', marginBottom:'16px'}}>🔔</div>
        <h3>Please sign in to view notifications</h3>
        <p>Sign in to your account to receive and manage notifications</p>
      </div>
    )
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div>
          <h2>Notifications</h2>
          <p className="notifications-subtitle">Stay updated with the latest activity</p>
        </div>
        <button onClick={markAllRead} className="btn btn-primary" disabled={notes.length === 0 || notes.every(n => n.read)}>
          Mark all read
        </button>
      </div>

      {loading ? (
        <div className="notifications-loading">
          <div className="skeleton-notification"></div>
          <div className="skeleton-notification"></div>
          <div className="skeleton-notification"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="notifications-empty">
          <div style={{fontSize:'3rem', marginBottom:'16px'}}>📭</div>
          <h3>No notifications yet</h3>
          <p>You're all caught up! Check back later for updates</p>
        </div>
      ) : (
        <div className="notifications-grid">
          {notes.map(n=> (
            <div key={n.id} className={`notification-item ${n.read ? 'is-read' : 'is-unread'}`}>
              <div className="notification-indicator"></div>
              <div className="notification-content">
                <div className="notification-title">{n.title || 'Notification'}</div>
                <div className="notification-body">{n.body}</div>
                <div className="notification-time">{new Date(n.createdAt?.toDate?.() || Date.now()).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .notifications-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 16px;
        }

        .notifications-header h2 {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
        }

        .notifications-subtitle {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
        }

        .notifications-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          background: var(--bg);
          border: 1px solid rgba(0, 0, 0, 0.06);
          transition: all 200ms ease;
          cursor: pointer;
        }

        .theme-dark .notification-item {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }

        .notification-item:hover {
          transform: translateX(4px);
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
        }

        .theme-dark .notification-item:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .notification-item.is-unread {
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.08), rgba(124, 58, 237, 0.06));
          border-color: rgba(96, 165, 250, 0.12);
        }

        .theme-dark .notification-item.is-unread {
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.12), rgba(124, 58, 237, 0.1));
          border-color: rgba(96, 165, 250, 0.2);
        }

        .notification-indicator {
          width: 3px;
          height: 100%;
          border-radius: 2px;
          background: transparent;
          flex-shrink: 0;
        }

        .notification-item.is-unread .notification-indicator {
          background: linear-gradient(180deg, #60a5fa, #7c3aed);
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          font-weight: 600;
          font-size: 15px;
          color: var(--text);
          margin-bottom: 4px;
        }

        .notification-body {
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .notification-time {
          font-size: 12px;
          color: var(--muted);
          opacity: 0.7;
        }

        .notifications-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: var(--muted);
        }

        .notifications-empty h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .notifications-empty p {
          margin: 0;
          font-size: 14px;
        }

        .notifications-loading {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-notification {
          height: 80px;
          border-radius: 12px;
          background: linear-gradient(90deg, var(--bg) 25%, rgba(0, 0, 0, 0.03) 50%, var(--bg) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s linear infinite;
        }

        .theme-dark .skeleton-notification {
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 640px) {
          .notifications-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .notifications-header button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
