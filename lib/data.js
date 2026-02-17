import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db, firebaseInitialized } from './firebase'

export async function getTrending(){
  if (!firebaseInitialized()) return { blogs: [], podcasts: [] }
  const blogsQ = query(collection(db,'blogs'), orderBy('views','desc'), limit(6))
  const pQ = query(collection(db,'podcasts'), orderBy('listens','desc'), limit(6))
  const [bSnap,pSnap] = await Promise.all([getDocs(blogsQ), getDocs(pQ)])
  const blogs = bSnap.docs.map(d => ({id:d.id, ...d.data(), type:'blog'}))
  const podcasts = pSnap.docs.map(d => ({id:d.id, ...d.data(), type:'podcast'}))
  return {blogs,podcasts}
}
