import useSWR from 'swr'
import MediaCard from '../components/MediaCard'
import HomeCard from '../components/HomeCard'
import SkeletonCard from '../components/SkeletonCard'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { getTrending } from '../lib/data'

export default function Home(){
  const { data, error } = useSWR('trending', getTrending)
  const [q, setQ] = useState('')

  if (error) return <div>Failed to load</div>
  if (!data) return (
    <div className="container">
      <div className="hero-skeleton">
        <div className="hero-card shimmer" />
      </div>
      <div className="trending-row">
        {Array.from({length:6}).map((_,i)=> <div key={i} className="trending-item skeleton shimmer" />)}
      </div>
      <div style={{marginTop:24}}>
        <div className="home-grid">
          {Array.from({length:6}).map((_,i)=> <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  )

  const combined = [...data.blogs, ...data.podcasts]
  const filtered = combined.filter(i => i.title?.toLowerCase().includes(q.toLowerCase()) || i.author?.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <motion.div className="hero" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:0.6}}>
        <div className="hero-inner">
          <div className="hero-left">
            <h1 className="hero-title">Wings Media — Read & Listen</h1>
            <p className="hero-sub">Discover the best blogs and podcasts. Curated, trending, and personalized for you.</p>
            <div style={{marginTop:12}}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by title or author" className="input" style={{maxWidth:520}} /></div>
          </div>
          <div className="hero-right">
            <div className="hero-graphic" />
          </div>
        </div>
      </motion.div>

      <h3 style={{marginTop:18,marginBottom:8}}>Trending Blogs</h3>
      <div className="trending-row snap-x">
        {data?.blogs.map(item => (
          <motion.div key={item.id} className="trending-item" whileHover={{scale:1.03}} whileTap={{scale:0.98}} transition={{type:'spring', stiffness:260}}>
            <img src={item.thumbnail || '/placeholder.png'} alt="blog thumbnail" style={{width:'160px',height:'100px',objectFit:'cover',borderRadius:10}} />
            <div className="trending-item-title">{item.title}</div>
          </motion.div>
        ))}
      </div>

      <h3 style={{marginTop:18,marginBottom:8}}>Trending Podcasts</h3>
      <div className="trending-row snap-x">
        {data?.podcasts.map(item => (
          <motion.div key={item.id} className="trending-item" whileHover={{scale:1.03}} whileTap={{scale:0.98}} transition={{type:'spring', stiffness:260}}>
            <img src={item.thumbnail || '/placeholder.png'} alt="podcast thumbnail" style={{width:'160px',height:'100px',objectFit:'cover',borderRadius:10}} />
            <div className="trending-item-title">{item.title}</div>
          </motion.div>
        ))}
      </div>

      <h2 style={{marginTop:22}}>Feed</h2>
      <div className="home-grid">
        {filtered.map(item => (
          <HomeCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
