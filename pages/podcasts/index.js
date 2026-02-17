import { useEffect, useState } from 'react'
// import MiniPlayer from '../../components/MiniPlayer'
import PodcastCard from '../../components/PodcastCard'
import MiniPlayer from '../../components/MiniPlayer'
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, limit, startAfter } from 'firebase/firestore'
import { db, storage, auth, firebaseInitialized } from '../../lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { supabase } from '../../lib/supabase'

export default function Podcasts(){
  const [list, setList] = useState([])
  const [lastDoc, setLastDoc] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [title,setTitle] = useState('')
  const [description,setDescription] = useState('')
  const [audioFile,setAudioFile] = useState(null)
  const [previewUrl,setPreviewUrl] = useState(null)
  const [nowPlaying, setNowPlaying] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState('feed')

  useEffect(()=>{
    async function fetch(){
      if (!firebaseInitialized()) return
      const q = query(collection(db,'podcasts'), orderBy('createdAt','desc'), limit(8))
      const snap = await getDocs(q)
      setList(snap.docs.map(d=>({id:d.id,...d.data()})))
      setLastDoc(snap.docs[snap.docs.length - 1])
    }
    fetch()
  },[])

  async function uploadToSupabase(file) {
    // const fileExt = file.name.split('.').pop()
    const fileName = `blog_${Date.now()}.${file.name}`
    const filePath = `blogs/${fileName}`

    // Upload image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('blog-images') // bucket name (you must create one named 'media')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  async function handleUpload(e){
    e.preventDefault()
    if (!firebaseInitialized()) { alert('Firebase not configured. See README to set .env.local'); return }
    if (!auth?.currentUser){
      alert('Please sign in to upload a podcast')
      return
    }
    if (!audioFile) {
      alert('Please select an audio file')
      return
    }

    if (! previewUrl){
      alert("Please select a thumbnail")
    }
    setUploading(true)
    let thumbUrl = ''
    try {
      if (previewUrl) {
    const thumbExt = previewUrl.name?.split('.').pop() || 'jpg'
    const thumbName = `thumb_${Date.now()}.${thumbExt}`
    const thumbPath = `thumbnails/${thumbName}`

    const { error: thumbError } = await supabase.storage
      .from('blog-images')
      .upload(thumbPath, previewUrl)

    if (thumbError) throw thumbError

    const { data: thumbData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(thumbPath)

    thumbUrl = thumbData.publicUrl;
    }
    const fileExt = audioFile.name.split('.').pop()
    const fileName = `audio_${Date.now()}.${fileExt}`
    const filePath = `audio/${fileName}`

    // Upload image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('podcasts') // bucket name (you must create one named 'media')
      .upload(filePath, audioFile)

    if (uploadError) throw uploadError

    // Get public URL
    const { data} = supabase.storage
      .from('podcasts')
      .getPublicUrl(filePath)

    const audUrl = data.publicUrl;

    // const storageRef = ref(storage, `podcasts/${Date.now()}_${audioFile.name}`)
    // await uploadBytes(storageRef, audioFile)
    // const url = await getDownloadURL(storageRef)
    const docRef = await addDoc(collection(db,'podcasts'),{
      title,
      description, 
      audioUrl: audUrl, 
      thumbnail:thumbUrl, 
      listens:0, 
      author: auth?.currentUser?.displayName || 'Anonymous', 
      createdAt: serverTimestamp()
    })
    setList([{id:docRef.id,title,description,audioUrl:audUrl,thumbnail:thumbUrl,listens:0,author:auth?.currentUser?.displayName||'Anonymous'},...list])
    setTitle(''); setDescription(''); setAudioFile(null); setPreviewUrl(null)
    setView('feed')
    setUploading(false)
    } catch (e){
      console.error('Upload failed', e)
      alert('Upload failed: ' + (e?.message || e))
      setUploading(false)
    }
  }

  function handlePlay(item){
    if (nowPlaying?.id === item.id){
      setIsPlaying(p=>!p)
    } else {
      setNowPlaying(item)
      setIsPlaying(true)
    }
  }

  return (
    <>
    <div className="container">
      <div className="podcasts-header">
        <div>
          <h2>Podcasts</h2>
          <p className="podcasts-subtitle">Explore engaging conversations and stories</p>
        </div>
      </div>

      <div className="view-tabs">
        <div className="segmented" role="tablist" aria-label="Podcasts view">
          <button type="button" role="tab" aria-selected={view==='feed'} className={`seg-btn ${view==='feed'?'active':''}`} onClick={()=>setView('feed')}>
            <span>🎙️</span> Feed
          </button>
          <button type="button" role="tab" aria-selected={view==='upload'} className={`seg-btn ${view==='upload'?'active':''}`} onClick={()=>setView('upload')}>
            <span>📤</span> Upload
          </button>
        </div>
      </div>

      {view === 'upload' && (
        <form onSubmit={handleUpload} className="upload-form">
          <h3>Upload New Podcast</h3>
          <input className="input" placeholder="Podcast title" value={title} onChange={e=>setTitle(e.target.value)} required />
          <textarea className="textarea" placeholder="Write a brief description" value={description} onChange={e=>setDescription(e.target.value)} required />
          
          <div className="upload-section">
            <label className="upload-label">🎵 Audio File</label>
            <div className="upload-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>{ e.preventDefault(); const f = e.dataTransfer.files[0]; if(f && f.type.startsWith('audio/')) setAudioFile(f); }}>
              <div className="upload-icon">🎙️</div>
              <div className="upload-text">
                <div className="upload-main">Drag & drop your audio file</div>
                <div className="upload-sub">MP3, WAV, or M4A format</div>
              </div>
              <input type="file" accept="audio/*" onChange={e=>setAudioFile(e.target.files[0])} />
            </div>
            {audioFile && <div className="file-selected">✓ {audioFile.name}</div>}
          </div>

          <div className="upload-section">
            <label className="upload-label">🖼️ Cover Image</label>
            <div className="upload-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>{ e.preventDefault(); const f = e.dataTransfer.files[0]; if(f && f.type.startsWith('image/')) setPreviewUrl(URL.createObjectURL(f)); }}>
              <div className="upload-icon">🖼️</div>
              <div className="upload-text">
                <div className="upload-main">Drag & drop cover image</div>
                <div className="upload-sub">or click to browse</div>
              </div>
              <input type="file" accept="image/*" onChange={e=>{ const f = e.target.files[0]; if(f) setPreviewUrl(URL.createObjectURL(f)); }} />
            </div>
            {previewUrl && <img src={previewUrl} className="preview-img" alt="preview" />}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={()=>setView('feed')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={uploading || !audioFile}>{uploading ? 'Uploading...' : 'Upload Podcast'}</button>
          </div>
        </form>
      )}

      {view === 'feed' && (
        <>
          <div className="podcasts-grid">
            {list.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎧</div>
                <h3>No podcasts yet</h3>
                <p>Share your voice and start your podcast journey</p>
              </div>
            ) : (
              list.map(p => (
                <PodcastCard key={p.id} item={p} onPlay={handlePlay} isCurrent={nowPlaying?.id===p.id} isPlaying={isPlaying} />
              ))
            )}
          </div>
          {lastDoc && list.length > 0 && (
            <div className="load-more-wrap">
              <button className="btn btn-ghost-outline" onClick={async ()=>{
                if (!firebaseInitialized()) return
                setLoadingMore(true)
                const q = query(collection(db,'podcasts'), orderBy('createdAt','desc'), startAfter(lastDoc), limit(8))
                const snap = await getDocs(q)
                setList(prev=>[...prev, ...snap.docs.map(d=>({id:d.id,...d.data()}))])
                setLastDoc(snap.docs[snap.docs.length -1] || null)
                setLoadingMore(false)
              }} disabled={loadingMore}>{loadingMore ? '⏳ Loading...' : '🎙️ Load More Podcasts'}</button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .podcasts-header {
          margin-bottom: 32px;
        }

        .podcasts-header h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
        }

        .podcasts-subtitle {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
        }

        .view-tabs {
          margin-bottom: 32px;
        }

        .segmented {
          display: inline-flex;
          gap: 8px;
          padding: 6px;
          border-radius: 10px;
          background: var(--bg);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .theme-dark .segmented {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .seg-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: var(--text);
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 200ms ease;
        }

        .seg-btn.active {
          background: linear-gradient(90deg, #60a5fa, #7c3aed);
          color: white;
          box-shadow: 0 6px 18px rgba(99, 102, 241, 0.18);
        }

        .seg-btn:hover:not(.active) {
          background: rgba(0, 0, 0, 0.04);
        }

        .theme-dark .seg-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.08);
        }

        .upload-form {
          max-width: 900px;
          padding: 28px;
          border-radius: 12px;
          background: var(--bg);
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
          margin-bottom: 32px;
        }

        .theme-dark .upload-form {
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
        }

        .upload-form h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .input, .textarea {
          width: 100%;
          padding: 12px;
          margin-bottom: 16px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: var(--bg);
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
        }

        .theme-dark .input, .theme-dark .textarea {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text);
        }

        .input::placeholder, .textarea::placeholder {
          color: var(--muted);
        }

        .textarea {
          min-height: 100px;
          resize: vertical;
        }

        .upload-section {
          margin-bottom: 24px;
        }

        .upload-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }

        .upload-zone {
          border: 2px dashed rgba(96, 165, 250, 0.3);
          padding: 32px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.06), rgba(124, 58, 237, 0.04));
          transition: all 200ms ease;
          position: relative;
          cursor: pointer;
        }

        .theme-dark .upload-zone {
          border-color: rgba(96, 165, 250, 0.2);
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(124, 58, 237, 0.08));
        }

        .upload-zone:hover {
          border-color: rgba(96, 165, 250, 0.5);
          background: rgba(96, 165, 250, 0.08);
        }

        .upload-zone input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .upload-icon {
          font-size: 2.5rem;
        }

        .upload-text {
          flex: 1;
        }

        .upload-main {
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }

        .upload-sub {
          font-size: 13px;
          color: var(--muted);
        }

        .file-selected {
          margin-top: 12px;
          padding: 10px 12px;
          background: rgba(34, 197, 94, 0.1);
          border-left: 3px solid #22c55e;
          border-radius: 6px;
          font-size: 13px;
          color: #22c55e;
          font-weight: 600;
        }

        .preview-img {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          border-radius: 8px;
          margin-top: 16px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
        }

        .theme-dark .preview-img {
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          border: 0;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 200ms ease;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(90deg, #60a5fa, #7c3aed);
          color: white;
          box-shadow: 0 6px 18px rgba(99, 102, 241, 0.12);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(99, 102, 241, 0.18);
        }

        .btn-ghost {
          background: transparent;
          color: var(--brand);
          border: 1px solid rgba(37, 99, 235, 0.12);
        }

        .theme-dark .btn-ghost {
          border-color: rgba(96, 165, 250, 0.2);
        }

        .btn-ghost:hover:not(:disabled) {
          background: rgba(37, 99, 235, 0.04);
          border-color: rgba(37, 99, 235, 0.25);
        }

        .btn-ghost-outline {
          background: transparent;
          color: var(--brand);
          border: 1px solid rgba(37, 99, 235, 0.2);
        }

        .btn-ghost-outline:hover {
          background: rgba(37, 99, 235, 0.04);
          border-color: rgba(37, 99, 235, 0.4);
        }

        .podcasts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 32px;
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

        .load-more-wrap {
          display: flex;
          justify-content: center;
          padding: 20px 0;
        }

        @media (max-width: 768px) {
          .upload-form {
            padding: 20px;
          }

          .upload-zone {
            flex-direction: column;
            padding: 24px;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
    <MiniPlayer track={nowPlaying} playing={isPlaying} onPause={()=>setIsPlaying(false)} onPlay={()=>setIsPlaying(true)} />
    </>
  )
}
