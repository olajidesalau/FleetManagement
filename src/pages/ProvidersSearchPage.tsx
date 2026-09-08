export const ProvidersSearchPage = ({ providers = [] }: { providers?: any[] } = {}) => {
  return (
    <div style="padding: 2rem; min-height: 100vh; background: #f5f5f5;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1>🔍 Search Service Providers</h1>

        {/* Search Filters */}
        <div style="background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <form method="get" action="/providers/search" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Postcode</label>
              <input type="text" name="postcode" placeholder="e.g., SW1A 1AA" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Service Type</label>
              <select name="serviceType" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">All Services</option>
                <option value="cleaning">Cleaning</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="carpentry">Carpentry</option>
                <option value="it_support">IT Support</option>
                <option value="web_development">Web Development</option>
                <option value="tutoring">Tutoring</option>
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Min Rating</label>
              <select name="minRating" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Max Price (£/hr)</label>
              <input type="number" name="maxPrice" placeholder="e.g., 50" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;" />
            </div>
            <div style="display: flex; align-items: flex-end;">
              <button type="submit" style="width: 100%; background: #4db8ff; color: black; padding: 0.5rem; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Search</button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div>
          {providers.length === 0 ? (
            <div style="background: white; padding: 2rem; text-align: center; border-radius: 8px;">
              <p style="font-size: 1.1rem; color: #666;">No providers found. Try adjusting your search filters.</p>
            </div>
          ) : (
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
              {providers.map((provider: any) => (
                <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h3 style="margin: 0 0 0.5rem 0;">{provider.business_name}</h3>
                  <p style="margin: 0; color: #666;">{provider.full_name}</p>
                  <div style="margin: 1rem 0; padding: 1rem 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
                    <p style="margin: 0.5rem 0;">⭐ {provider.average_rating || 'N/A'} ({provider.total_reviews || 0} reviews)</p>
                    <p style="margin: 0.5rem 0;">💷 £{provider.hourly_rate}/hour</p>
                    <p style="margin: 0.5rem 0;">👨‍💼 {provider.experience_years || 'Unknown'} years experience</p>
                  </div>
                  <p style="margin: 0.5rem 0; font-size: 0.9rem; color: #666;">{provider.bio || 'No bio provided'}</p>
                  <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <a href={`/providers/${provider.user_id}`} style="flex: 1; background: #4db8ff; color: black; padding: 0.5rem; border-radius: 4px; text-decoration: none; text-align: center; font-weight: bold;">View Profile</a>
                    <a href={`/messages/new?to=${provider.user_id}`} style="flex: 1; background: #f0f0f0; color: black; padding: 0.5rem; border-radius: 4px; text-decoration: none; text-align: center; font-weight: bold;">Message</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
