export const ProfilePage = () => (
  <div class="fleet-dashboard profile-page" data-profile-page>
    <div class="page-heading"><div><p class="eyebrow">Signed-in account</p><h1>My profile</h1><p class="header-copy">Your identity, role, and fleet permissions in Snow Fleet Management.</p></div><span class="sync-status"><span class="status-dot status-dot-live"></span><span data-profile-status>Loading profile</span></span></div>
    <div class="profile-grid">
      <section class="panel profile-card"><div class="profile-identity"><span class="profile-avatar" data-profile-initials>--</span><div><h2 data-profile-name>Loading...</h2><p data-profile-role>Signed-in user</p><span class="pill pill-green" data-profile-account-status>Active</span></div></div><div class="profile-facts"><div><span>Email</span><strong data-profile-email>--</strong></div><div><span>Phone</span><strong data-profile-phone>--</strong></div><div><span>Member since</span><strong data-profile-created>--</strong></div></div></section>
      <section class="panel role-card"><div class="panel-heading"><div><p class="eyebrow">Role profile</p><h2 data-profile-role-title>Profile data</h2></div></div><div class="role-data" data-profile-role-data><span>Loading role data...</span></div></section>
    </div>
    <section class="panel profile-edit-panel"><div class="panel-heading"><div><p class="eyebrow">Account details</p><h2>Update contact information</h2></div><a class="text-link" href="/messages">Open messages <span>→</span></a></div><form class="profile-form" data-profile-form><label>Full name<input name="full_name" data-profile-full-name required /></label><label>Phone<input name="phone" data-profile-phone-input /></label><button class="button button-primary" type="submit">Save changes</button><p class="profile-form-status" data-profile-form-status></p></form></section>
  </div>
)
