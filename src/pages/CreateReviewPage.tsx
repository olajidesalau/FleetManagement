export const CreateReviewPage = ({ booking = null, provider = null }: { booking?: any, provider?: any } = {}) => {
  return (
    <div style="padding:2rem; min-height:100vh; background:#f7fafc;">
      <div style="max-width:800px; margin:0 auto;">
        <h1>✍️ Leave a Review</h1>

        {booking && provider ? (
          <div style="background:white; padding:1.5rem; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
            <div style="font-weight:bold;">Provider: <a href={`/providers/${provider.user_id}`} style="text-decoration:none;color:#333;">{provider.business_name}</a></div>
            <div style="margin:0.5rem 0 1rem 0; color:#666;">Booking ID: {booking.id}</div>

            <form data-review-form style="display:grid; gap:0.75rem;">
              <input type="hidden" name="provider_id" value={provider.user_id} />
              <input type="hidden" name="booking_id" value={booking.id} />

              <label style="font-weight:bold;">Rating (1-5)</label>
              <select name="rating" required style="padding:0.5rem; border:1px solid #ddd; border-radius:4px;">
                <option value="">Select rating</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>

              <label style="font-weight:bold;">Comment</label>
              <textarea name="comment" rows={4} required style="padding:0.75rem; border:1px solid #ddd; border-radius:4px;"></textarea>

              <button type="submit" style="background:#4caf50; color:white; border:none; padding:0.75rem; border-radius:4px; font-weight:bold; cursor:pointer;">Submit Review</button>
            </form>
          </div>
        ) : (
          <div style="background:white; padding:1.5rem; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.04); text-align:center; color:#666;">Invalid booking or provider information.</div>
        )}
      </div>
    </div>
  )
}