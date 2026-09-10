export const LoginPage = () => {
  return (
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <span class="login-mark">S</span>
          <p class="eyebrow">Snow Fleet Management</p>
          <h1>Welcome back</h1>
          <p>Sign in to coordinate routes, vehicles, drivers, and deliveries.</p>
        </div>

        <form method="post" action="/api/auth/login" class="login-form">
          <div>
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="your@email.com"
              class="login-input"
            />
          </div>

          <div>
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="••••••••"
              class="login-input"
            />
          </div>

          <button type="submit" class="login-button">
            Login
          </button>
        </form>

        <div class="login-footer">
          <p>Don't have an account? <a href="/auth/register">Register here</a></p>
        </div>

      </div>
    </div>
  )
}
