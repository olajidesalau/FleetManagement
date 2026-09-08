export const LoginPage = () => {
  return (
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); width: 100%; max-width: 400px;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="margin: 0; font-size: 2rem;">❄️</h1>
          <h2 style="margin: 0.5rem 0 0 0;">Snow Fleet Management</h2>
        </div>

        <form method="post" action="/api/auth/login" style="display: grid; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #333;">Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="your@email.com"
              style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"
            />
          </div>

          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #333;">Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="••••••••"
              style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"
            />
          </div>

          <button 
            type="submit" 
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.75rem; border: none; border-radius: 4px; font-weight: bold; font-size: 1.1rem; cursor: pointer;"
          >
            Login
          </button>
        </form>

        <div style="text-align: center; margin-top: 1.5rem;">
          <p style="margin: 0; color: #666;">Don't have an account? <a href="/auth/register" style="color: #667eea; text-decoration: none; font-weight: bold;">Register here</a></p>
        </div>

        <div style="margin-top: 1.5rem; padding: 1rem; background: #f5f5f5; border-radius: 4px; font-size: 0.9rem; color: #666;">
          <p style="margin: 0;"><strong>Demo credentials:</strong></p>
          <p style="margin: 0.25rem 0;">Customer: john.smith@email.uk / password</p>
          <p style="margin: 0.25rem 0;">Provider: sarah.cleaner@email.uk / password</p>
          <p style="margin: 0.25rem 0;">Fleet manager access: admin@snowfleetmanagement.uk / admin_password</p>
        </div>
      </div>
    </div>
  )
}
