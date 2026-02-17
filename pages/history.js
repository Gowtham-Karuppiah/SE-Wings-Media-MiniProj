import { useEffect, useState } from 'react'
import { getHistory, clearHistory } from '../lib/bookmarks'
import MediaCard from '../components/MediaCard'
import PodcastCard from '../components/PodcastCard'
import Link from 'next/link'

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  function loadHistory() {
    setLoading(true)
    const items = getHistory()
    setHistory(items)
    setLoading(false)
  }

  function handleClearAll() {
    if (confirm('Are you sure you want to clear all viewing history?')) {
      clearHistory()
      setHistory([])
    }
  }

  const blogHistory = history.filter(h => h.type === 'blog')
  const podcastHistory = history.filter(h => h.type === 'podcast')

  return (
    <div className="container">
      <div className="history-header">
        <div>
          <h2>Viewing History</h2>
          <p className="history-subtitle">Recently viewed content</p>
        </div>
        {history.length > 0 && (
          <button className="btn btn-danger-outline" onClick={handleClearAll}>
            Clear History
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <h3>No history yet</h3>
          <p>Your recently viewed content will appear here</p>
          <Link href="/" className="btn btn-primary">
            Start Exploring
          </Link>
        </div>
      ) : (
        <>
          {blogHistory.length > 0 && (
            <div className="history-section">
              <h3 className="section-title">📚 Blogs ({blogHistory.length})</h3>
              <div className="history-grid">
                {blogHistory.map(item => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {podcastHistory.length > 0 && (
            <div className="history-section">
              <h3 className="section-title">🎙️ Podcasts ({podcastHistory.length})</h3>
              <div className="history-grid">
                {podcastHistory.map(item => (
                  <PodcastCard key={item.id} item={item} onPlay={() => {}} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 16px;
        }

        .history-header h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
        }

        .history-subtitle {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
        }

        .btn {
          padding: 10px 16px;
          border-radius: 8px;
          border: 0;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 200ms ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background: linear-gradient(90deg, #60a5fa, #7c3aed);
          color: white;
          margin-top: 16px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(99, 102, 241, 0.18);
        }

        .btn-danger-outline {
          background: transparent;
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .btn-danger-outline:hover {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.4);
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-top-color: var(--brand);
          border-radius: 50%;
          animation: spin 800ms linear infinite;
        }

        .theme-dark .spinner {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
          color: var(--muted);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .empty-state p {
          margin: 0 0 16px 0;
          font-size: 14px;
        }

        .history-section {
          margin-bottom: 48px;
        }

        .section-title {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }

        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .history-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .history-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
