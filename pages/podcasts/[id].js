import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc, increment, collection, addDoc, query, orderBy, getDocs, serverTimestamp } from 'firebase/firestore'
import { db, firebaseInitialized, auth } from '../../lib/firebase'

export default function PodcastDetail(){
  const router = useRouter()
  const { id } = router.query
  const [item, setItem] = useState(null)
  const [comments, setComments] = useState([])
  const [error, setError] = useState(null)

  useEffect(()=>{
    if (!id) return
    if (!firebaseInitialized()) return
    let cancelled = false
    const refDoc = doc(db,'podcasts',id)
    async function load(){
      try{
        // increment listens atomically
        try {
          await updateDoc(refDoc, { listens: increment(1) })
        } catch (incErr) {
          console.warn('Increment listens failed, will try to read doc:', incErr?.message || incErr)
        }
        const fresh = await getDoc(refDoc)
        const data = fresh.data()
        // validate required fields
        if (!data.title || !data.audioUrl || !data.author) {
          if (!cancelled) {
            setError('This podcast appears to be missing required fields.')
            setItem({id:fresh.id,...data})
          }
        } else {
          if (!cancelled) setItem({id:fresh.id,...data})
        }
        // load comments
        const commentsQ = query(collection(db,'podcasts',id,'comments'), orderBy('createdAt','desc'))
        const cSnap = await getDocs(commentsQ)
        if (!cancelled) setComments(cSnap.docs.map(d=>({id:d.id,...d.data()})))
      }catch(e){ console.error(e) }
    }
    load()
    return ()=>{ cancelled = true }
  },[id])

  if (!item) return <div>Loading...</div>
  if (error) return <div style={{color:'crimson'}}>{error}</div>

  return (
    <div>
      <h2>{item.title}</h2>
      <div style={{color:'#666'}}>{item.author} • {item.listens || 0} listens</div>
      {item.audioUrl && <audio controls src={item.audioUrl} style={{width:'100%',marginTop:12}} />}
      <div style={{marginTop:12}}>{item.description}</div>

      <section style={{marginTop:24}}>
        <h3>Comments</h3>
        <CommentForm postId={id} onNewComment={c=>setComments(prev=>[c,...prev])} />
        <div style={{display:'grid',gap:8,marginTop:12}}>
          {comments.length === 0 ? <div>No comments yet</div> : comments.map(c=> (
            <div key={c.id} style={{border:'1px solid #eee',padding:8,borderRadius:6}}>
              <div style={{fontSize:13,fontWeight:600}}>{c.author}</div>
              <div style={{fontSize:13,color:'#333'}}>{c.text}</div>
              <div style={{fontSize:11,color:'#888'}}>{new Date(c.createdAt?.toDate?.() || Date.now()).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function CommentForm({postId,onNewComment}){
  const [text,setText] = useState('')
  const [loading,setLoading] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    if (!firebaseInitialized()) { alert('Firebase not configured'); return }
    if (!auth?.currentUser) { alert('Please sign in to comment'); return }
    if (!text.trim()) return
    setLoading(true)
    const colRef = collection(db,'podcasts',postId,'comments')
    const docRef = await addDoc(colRef, { text, author: auth?.currentUser?.displayName || 'Anonymous', createdAt: serverTimestamp() })
    onNewComment({id:docRef.id, text, author: auth?.currentUser?.displayName || 'Anonymous', createdAt: new Date()})
    setText('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{marginTop:12}}>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment" style={{width:'100%',minHeight:80}} />
      <div>
        <button disabled={loading} style={{marginTop:8}}>Post comment</button>
      </div>
    </form>
  )
}
