import Link from 'next/link'

export default function MediaCard({item, type='blog'}){
  return (
    <article className="card media-card">
      <img src={item.thumbnail || '/placeholder.png'} alt="thumb" />
      <div style={{flex:1}}>
        <h3>{item.title}</h3>
        <p>{item.description?.slice(0,140)}</p>
        <div className="meta">{item.author} • {item.views || item.listens || 0} views</div>
      </div>
      <div style={{alignSelf:'center'}}>
        <Link href={`/${type}s/${item.id || ''}`} className="btn btn-ghost">Open</Link>
      </div>
    </article>
  )
}
