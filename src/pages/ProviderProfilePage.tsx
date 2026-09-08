export const ProviderProfilePage = ({ provider = {}, services = [] }: { provider?: any; services?: any[] } = {}) => {
  return (
    <div style="padding: 2rem; min-height: 100vh; background: #f5f5f5;">
      <div style="max-width: 1000px; margin: 0 auto;">
        {/* Profile Header */}
        <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem;">
          <div style="display: grid; grid-template-columns: 200px 1fr; gap: 2rem;">
            {/* Avatar/Profile Image */}
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; height: 200px; display: flex; align-items: center; justify-content: center; color: white; font-size: 4rem;">
              👤
            </div>

            {/* Profile Info */}
            <div>
              <h1 style="margin: 0 0 0.5rem 0;">{provider.business_name || 'Provider Name'}</h1>
              <p style="margin: 0 0 1rem 0; color: #666; font-size: 1.1rem;">{provider.full_name}</p>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0;">
                <div>
                  <p style="margin: 0; color: #999; font-size: 0.9rem;">RATING</p>
                  <p style="margin: 0; font-size: 1.3rem; font-weight: bold;">⭐ {provider.average_rating || 'N/A'}</p>
                  <p style="margin: 0; color: #999; font-size: 0.9rem;">({provider.total_reviews || 0} reviews)</p>
                </div>
                <div>
                  <p style="margin: 0; color: #999; font-size: 0.9rem;">HOURLY RATE</p>
                  <p style="margin: 0; font-size: 1.3rem; font-weight: bold;">£{provider.hourly_rate}/hr</p>
                </div>
                <div>
                  <p style="margin: 0; color: #999; font-size: 0.9rem;">EXPERIENCE</p>
                  <p style="margin: 0; font-size: 1.3rem; font-weight: bold;">{provider.experience_years || 'N/A'} years</p>
                </div>
                <div>
                  <p style="margin: 0; color: #999; font-size: 0.9rem;">STATUS</p>
                  <p style="margin: 0; font-size: 1.3rem; font-weight: bold;">✅ Approved</p>
                </div>
              </div>

              {provider.bio && (
                <p style="margin: 1rem 0; padding: 1rem; background: #f9f9f9; border-radius: 4px; border-left: 4px solid #4db8ff;">
                  {provider.bio}
                </p>
              )}

              <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <a href={`/messages?provider=${provider.user_id}`} style="background: #4db8ff; color: black; padding: 0.75rem 1.5rem; border-radius: 4px; text-decoration: none; font-weight: bold;">Message Provider</a>
                {provider.dbs_verified && <span style="background: #4caf50; color: white; padding: 0.75rem 1rem; border-radius: 4px; font-weight: bold;">✓ DBS Verified</span>}
                {provider.insurance_verified && <span style="background: #4caf50; color: white; padding: 0.75rem 1rem; border-radius: 4px; font-weight: bold;">✓ Insured</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem;">
          <h2 style="margin: 0 0 1rem 0;">📍 Service Areas</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            {provider.service_areas && provider.service_areas.length > 0 ? (
              provider.service_areas.map((area: string) => (
                <span style="background: #e3f2fd; color: #2196f3; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">{area}</span>
              ))
            ) : (
              <p style="color: #999;">No service areas specified</p>
            )}
          </div>
        </div>

        {/* Services */}
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem;">
          <h2 style="margin: 0 0 1rem 0;">🛠️ Services Offered</h2>
          {services.length === 0 ? (
            <p style="color: #999;">No services listed yet</p>
          ) : (
            <div style="display: grid; gap: 1rem;">
              {services.map((service: any) => (
                <div style="padding: 1rem; background: #f9f9f9; border-radius: 4px; border-left: 4px solid #4db8ff;">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                      <h4 style="margin: 0 0 0.5rem 0;">{service.service_name}</h4>
                      <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;">{service.service_type}</p>
                      <p style="margin: 0; color: #666;">{service.description}</p>
                    </div>
                    <div style="text-align: right;">
                      <p style="margin: 0; font-size: 1.3rem; font-weight: bold;">£{service.price}</p>
                      <p style="margin: 0; color: #999; font-size: 0.9rem;">{service.duration_minutes} mins</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 1rem 0;">⭐ Customer Reviews</h2>
          <div style="display: grid; gap: 1rem;">
            <div style="padding: 1rem; background: #f9f9f9; border-radius: 4px; border-left: 4px solid #ff9800;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <strong>John Smith</strong>
                <span style="font-size: 1.2rem;">⭐⭐⭐⭐⭐</span>
              </div>
              <p style="margin: 0; color: #666;">Excellent service! Very professional and thorough. Highly recommend!</p>
              <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #999;">2 weeks ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
