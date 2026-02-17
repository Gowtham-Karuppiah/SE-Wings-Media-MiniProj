export default function SkeletonCard(){
  return (
    <div className="card home-card skeleton">
      <div className="skeleton-media shimmer" />
      <div className="skeleton-line shimmer" style={{width:'60%'}} />
      <div className="skeleton-line shimmer" style={{width:'40%'}} />
    </div>
  )
}
