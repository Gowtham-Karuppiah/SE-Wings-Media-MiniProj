import { useEffect, useState } from 'react'
import { getBookmarks, clearBookmarks, removeBookmark } from '../lib/bookmarks'
import MediaCard from '../components/MediaCard'
import PodcastCard from '../components/PodcastCard'

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookmarks()
  }, [])

  function loadBookmarks() {
    setLoading(true)
    const items = getBookmarks()
    setBookmarks(items)
    setLoading(false)
  }

  function handleRemove(itemId) {
    removeBookmark(itemId)
    setBookmarks(prev => prev.filter(b => b.id !== itemId))
  }

  function handleClearAll() {
    if (confirm('Are you sure you want to clear all bookmarks?')) {
      clearBookmarks()
      setBookmarks([])
    }
  }

  const filteredBookmarks = filter === 'all' 
    ? bookmarks 
    : bookmarks.filter(b => b.type === filter)

  return (
    <div className="container">
      <div className="bookmarks-header">
        <div>
          <h2>Saved Bookmarks</h2>
          <p className="bookmarks-subtitle">Your collection of favorite content</p>
        </div>
        {bookmarks.length > 0 && (
          <button className="btn btn-danger-outline" onClick={handleClearAll}>
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h3>No bookmarks yet</h3>
          <p>Save your favorite blogs and podcasts to access them later</p>
        </div>
      ) : (
        <>
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({bookmarks.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'blog' ? 'active' : ''}`}
              onClick={() => setFilter('blog')}
            >
              Blogs ({bookmarks.filter(b => b.type === 'blog').length})
            </button>
            <button 
              className={`filter-tab ${filter === 'podcast' ? 'active' : ''}`}
              onClick={() => setFilter('podcast')}
            >
              Podcasts ({bookmarks.filter(b => b.type === 'podcast').length})
            </button>
          </div>

          <div className="bookmarks-grid">
            {filteredBookmarks.map(item => (
              <div key={item.id} className="bookmark-item">
                {item.type === 'blog' ? 
                  <MediaCard item={item} /> :
                  <PodcastCard item={item} onPlay={() => {}} />
                }
                <button 
                  className="remove-bookmark"
                  onClick={() => handleRemove(item.id)}
                  title="Remove from bookmarks"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .bookmarks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 16px;
        }

        .bookmarks-header h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
        }

        .bookmarks-subtitle {
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
          margin: 0;
          font-size: 14px;
        }

        .filter-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .theme-dark .filter-tabs {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .filter-tab {
          padding: 12px 16px;
          border: 0;
          background: transparent;
          color: var(--text);
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          border-bottom: 3px solid transparent;
          transition: all 200ms ease;
        }

        .filter-tab:hover {
          color: var(--brand);
        }

        .filter-tab.active {
          color: var(--brand);
          border-bottom-color: var(--brand);
        }

        .bookmarks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .bookmark-item {
          position: relative;
        }

        .remove-bookmark {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: 0;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 200ms ease;
          z-index: 10;
        }

        .remove-bookmark:hover {
          background: rgba(239, 68, 68, 0.8);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .bookmarks-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .bookmarks-grid {
            grid-template-columns: 1fr;
          }

          .filter-tabs {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  )
}
