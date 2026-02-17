import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import MediaCard from '../components/MediaCard'
import PodcastCard from '../components/PodcastCard'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db, firebaseInitialized } from '../lib/firebase'

export default function Search() {
  const router = useRouter()
  const { q } = router.query
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!q) return
    searchContent()
  }, [q, filter])

  async function searchContent() {
    if (!firebaseInitialized() || !q) return
    setLoading(true)
    
    try {
      const searchTerm = q.toLowerCase()
      let allResults = []

      if (filter === 'all' || filter === 'blogs') {
        const blogsSnap = await getDocs(collection(db, 'blogs'))
        const blogs = blogsSnap.docs
          .map(d => ({ id: d.id, ...d.data(), type: 'blog' }))
          .filter(b => 
            b.title?.toLowerCase().includes(searchTerm) ||
            b.description?.toLowerCase().includes(searchTerm) ||
            b.author?.toLowerCase().includes(searchTerm)
          )
        allResults = [...allResults, ...blogs]
      }

      if (filter === 'all' || filter === 'podcasts') {
        const podcastsSnap = await getDocs(collection(db, 'podcasts'))
        const podcasts = podcastsSnap.docs
          .map(d => ({ id: d.id, ...d.data(), type: 'podcast' }))
          .filter(p => 
            p.title?.toLowerCase().includes(searchTerm) ||
            p.description?.toLowerCase().includes(searchTerm) ||
            p.author?.toLowerCase().includes(searchTerm)
          )
        allResults = [...allResults, ...podcasts]
      }

      setResults(allResults)
    } catch (err) {
      console.error('Search error:', err)
    }
    setLoading(false)
  }

  return (
    <div className="container">
      <div className="search-header">
        <h2>Search Results</h2>
        <p className="search-query">Results for "{q}"</p>
      </div>

      <div className="search-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Content
        </button>
        <button 
          className={`filter-btn ${filter === 'blogs' ? 'active' : ''}`}
          onClick={() => setFilter('blogs')}
        >
          Blogs
        </button>
        <button 
          className={`filter-btn ${filter === 'podcasts' ? 'active' : ''}`}
          onClick={() => setFilter('podcasts')}
        >
          Podcasts
        </button>
      </div>

      {loading ? (
        <div className="search-loading">
          <div className="spinner"></div>
          <p>Searching...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="search-empty">
          <div className="empty-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try searching with different keywords</p>
        </div>
      ) : (
        <div className="search-results">
          <p className="results-count">Found {results.length} result{results.length !== 1 ? 's' : ''}</p>
          <div className="results-grid">
            {results.map(item => 
              item.type === 'blog' ? 
                <MediaCard key={item.id} item={item} /> :
                <PodcastCard key={item.id} item={item} onPlay={() => {}} />
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .search-header {
          margin-bottom: 32px;
        }

        .search-header h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
        }

        .search-query {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
        }

        .search-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
        }

        .filter-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: var(--bg);
          color: var(--text);
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 200ms ease;
        }

        .theme-dark .filter-btn {
          border-color: rgba(255, 255, 255, 0.08);
        }

        .filter-btn:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .theme-dark .filter-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .filter-btn.active {
          background: linear-gradient(90deg, #60a5fa, #7c3aed);
          color: white;
          border-color: transparent;
        }

        .search-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-top-color: var(--brand);
          border-radius: 50%;
          animation: spin 800ms linear infinite;
          margin-bottom: 16px;
        }

        .theme-dark .spinner {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .search-empty {
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

        .search-empty h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .search-empty p {
          margin: 0;
          font-size: 14px;
        }

        .search-results {
          margin-bottom: 32px;
        }

        .results-count {
          margin: 0 0 16px 0;
          font-size: 13px;
          color: var(--muted);
          font-weight: 600;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .search-filters {
            flex-wrap: wrap;
          }

          .results-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
