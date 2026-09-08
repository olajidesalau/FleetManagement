export const MyReviewsPage = ({ reviews = [] }: { reviews?: any[] } = {}) => {
  return (
    <div style="padding:2rem; min-height:100vh; background:#f7fafc;">
      <div style="max-width:1000px; margin:0 auto;">
        <h1>⭐ My Reviews</h1>

        {reviews.length === 0 ? (
          <div style="background:white; padding:2rem; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
            <p style="margin:0; color:#666;">You haven't left any reviews yet.</p>
          </div>
        ) : (
          <div style="display:grid; gap:1rem; margin-top:1rem;">
            {reviews.map(r => (
              <div style="background:white; padding:1rem; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.03);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <a href={`/providers/${r.provider_id}`} style="font-weight:bold; color:#333; text-decoration:none;">{r.provider_name}</a>
                  <div style="color:#888; font-size:0.9rem;">{r.created_at}</div>
                </div>
                <div style="margin-top:0.5rem;">Rating: <strong>{r.rating}</strong></div>
                <p style="margin-top:0.75rem; color:#333;">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}