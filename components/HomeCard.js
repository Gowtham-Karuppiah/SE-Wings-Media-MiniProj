import Link from 'next/link'

export default function HomeCard({item}){
  const isPodcast = item.type === 'podcast'
  return (
    <article className="card home-card">
      <div className="home-card-media">
        <img className="home-card-img" src={item.thumbnail || '/placeholder.png'} alt="thumb" />
        {/* preview overlay for blogs */}
        {item.type === 'blog' && (
          <div className="blog-preview-overlay">
            <div className="blog-preview-text">{item.content ? item.content.slice(0,220) : item.description?.slice(0,220)}</div>
            <a className="overlay-cta" href={`/blogs/${item.id}`}>Read article →</a>
          </div>
        )}
      </div>
      <div className="home-card-body">
        <h3 className="home-card-title">{item.title}</h3>
        <div className="home-card-meta">{item.author} • {new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</div>
        <p className="home-card-desc">{item.description?.slice(0,140)}</p>
        <div className="home-card-footer">
          <div className="home-card-stats">{isPodcast ? (item.listens||0)+' listens' : (item.views||0)+' views'}</div>
          <Link href={`/${isPodcast?'podcasts':'blogs'}/${item.id}`} className="btn btn-primary">{isPodcast ? 'Play' : 'Read more'}</Link>
        </div>
      </div>
    </article>
  )
}
