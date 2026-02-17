import { useEffect, useRef, useState } from 'react'

export default function MiniPlayer({track, playing, onPause, onPlay}){
  const audioRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(()=>{
    if (!track) return

    // create a fresh audio element when track changes to avoid reusing
    // the same element and accidentally accumulating listeners
    const audio = new Audio()
    audioRef.current = audio
    audio.src = track.audioUrl
    audio.preload = 'auto'

    const onTime = ()=> setProgress((audio.currentTime / (audio.duration || 1)) * 100)
    const onEnded = ()=> setProgress(0)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)

    // play/pause is controlled below by playing state
    if (playing) {
      // play returns a promise; swallow errors (autoplay restrictions)
      audio.play().catch(()=>{})
    }

    return ()=>{
      // cleanup listeners and pause/neutralize audio to release resources
      try{
        audio.pause()
        audio.removeEventListener('timeupdate', onTime)
        audio.removeEventListener('ended', onEnded)
        // revoke src to free memory
        audio.src = ''
      }catch(e){}
    }
  },[track])

  // control play/pause without reattaching listeners
  useEffect(()=>{
    const audio = audioRef.current
    if (!audio) return
    if (playing) audio.play().catch(()=>{})
    else audio.pause()
  },[playing])

  if (!track) return null

  return (
    <div style={{position:'fixed',left:12,right:12,bottom:12,background:'rgba(0,0,0,0.75)',color:'white',padding:12,borderRadius:12,display:'flex',alignItems:'center',gap:12,zIndex:80}}>
      <img src={track.thumbnail || '/placeholder.png'} alt="mini" style={{width:56,height:56,objectFit:'cover',borderRadius:8}} />
      <div style={{flex:1}}>
        <div style={{fontWeight:700}}>{track.title}</div>
        <div style={{height:6,background:'rgba(255,255,255,0.12)',borderRadius:6,overflow:'hidden',marginTop:6}}>
          <div style={{width:progress+'%',height:'100%',background:'linear-gradient(90deg,#60a5fa,#7c3aed)'}} />
        </div>
      </div>
      <div>
        {playing ? <button className="btn btn-ghost" onClick={onPause}>Pause</button> : <button className="btn btn-primary" onClick={onPlay}>Play</button>}
      </div>
    </div>
  )
}
