export const AdminProvidersPage = ({ providers = [] }: { providers?: any[] } = {}) => {
  const getPendingCount = (providers: any[]) => providers.filter((p: any) => p.approval_status === 'pending').length

  return (
    <div style="padding: 2rem; min-height: 100vh; background: #f5f5f5;">
      <div style="max-width: 1400px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h1>🏢 Provider Management</h1>
          <a href="/admin/dashboard" style="background: #4db8ff; color: black; padding: 0.5rem 1rem; border-radius: 4px; text-decoration: none; font-weight: bold;">← Back</a>
        </div>

        {/* Stats */}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">APPROVED</p>
            <p style="margin: 0; font-size: 1.8rem; font-weight: bold;">{providers.filter((p: any) => p.approval_status === 'approved').length}</p>
          </div>
          <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #ff9800;">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">PENDING</p>
            <p style="margin: 0; font-size: 1.8rem; font-weight: bold;">{getPendingCount(providers)}</p>
          </div>
          <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #f44336;">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">REJECTED</p>
            <p style="margin: 0; font-size: 1.8rem; font-weight: bold;">{providers.filter((p: any) => p.approval_status === 'rejected').length}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style="background: white; padding: 1rem; border-radius: 8px 8px 0 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 0; display: flex; gap: 1rem;">
          <a href="/admin/providers" style="color: #4db8ff; text-decoration: none; padding: 0.5rem 1rem; border-bottom: 3px solid #4db8ff; font-weight: bold;">All</a>
          <a href="/admin/providers?status=pending" style="color: #999; text-decoration: none; padding: 0.5rem 1rem;">Pending Approval ({getPendingCount(providers)})</a>
          <a href="/admin/providers?status=approved" style="color: #999; text-decoration: none; padding: 0.5rem 1rem;">Approved</a>
          <a href="/admin/providers?status=rejected" style="color: #999; text-decoration: none; padding: 0.5rem 1rem;">Rejected</a>
        </div>

        {/* Providers List */}
        <div style="background: white; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Business Name</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Provider</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Status</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Rating</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Hourly Rate</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">DBS</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Insurance</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.length === 0 ? (
                <tr>
                  <td colSpan={8} style="padding: 2rem; text-align: center; color: #999;">No providers found</td>
                </tr>
              ) : (
                providers.map((provider: any) => (
                  <tr style="border-bottom: 1px solid #eee; hover:background: #f9f9f9;">
                    <td style="padding: 1rem;"><strong>{provider.business_name}</strong></td>
                    <td style="padding: 1rem;">{provider.full_name}</td>
                    <td style="padding: 1rem;">
                      <span style={`background: ${provider.approval_status === 'pending' ? '#ff9800' : provider.approval_status === 'approved' ? '#4caf50' : '#f44336'}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.9rem;`}>
                        {provider.approval_status}
                      </span>
                    </td>
                    <td style="padding: 1rem;">⭐ {provider.average_rating || 'N/A'}</td>
                    <td style="padding: 1rem;">£{provider.hourly_rate}</td>
                    <td style="padding: 1rem;">
                      <span style={`color: ${provider.dbs_verified ? '#4caf50' : '#999'}`}>
                        {provider.dbs_verified ? '✓' : '✗'}
                      </span>
                    </td>
                    <td style="padding: 1rem;">
                      <span style={`color: ${provider.insurance_verified ? '#4caf50' : '#999'}`}>
                        {provider.insurance_verified ? '✓' : '✗'}
                      </span>
                    </td>
                    <td style="padding: 1rem;">
                      <div style="display: flex; gap: 0.5rem;">
                        <a href={`/admin/providers/${provider.id}`} style="background: #2196f3; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; text-decoration: none; font-size: 0.9rem;">View</a>
                        {provider.approval_status === 'pending' && (
                          <>
                            <form method="post" action={`/admin/providers/${provider.id}/approval`} style="margin: 0;">
                              <input type="hidden" name="status" value="approved" />
                              <button type="submit" style="background: #4caf50; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Approve</button>
                            </form>
                            <form method="post" action={`/admin/providers/${provider.id}/approval`} style="margin: 0;">
                              <input type="hidden" name="status" value="rejected" />
                              <button type="submit" style="background: #f44336; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Reject</button>
                            </form>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
