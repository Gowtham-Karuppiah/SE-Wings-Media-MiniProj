import React from 'react'

export default function PodcastCard({item, onPlay, isCurrent, isPlaying}){
  return (
    <div className="card podcast-card" style={{display:'flex',gap:12,alignItems:'center'}}>
      <div className="podcast-thumb-wrap">
        <img src={item.thumbnail} alt="cover" className="podcast-thumb" />
        <button className={`podcast-play-btn ${isCurrent && isPlaying ? 'playing' : ''}`} onClick={()=>onPlay(item)} aria-label="Play">
          ▶
        </button>
      </div>
      <div style={{flex:1}}>
        <h3 style={{margin:'4px 0'}}>{item.title}</h3>
        <div style={{fontSize:13,color:'var(--muted)'}}>{item.author} • {new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</div>
        <p style={{marginTop:8,color:'#374151'}}>{item.description?.slice(0,160)}</p>
        <div style={{display:'flex',gap:12,alignItems:'center',marginTop:8}}>
          <div style={{fontSize:13,color:'#6b7280'}}>{item.listens || 0} listens</div>
          <a href={`/podcasts/${item.id}`} className="btn btn-ghost">Open</a>
        </div>
      </div>
    </div>
  )
}
