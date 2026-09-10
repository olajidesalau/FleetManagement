import { jsxRenderer } from 'hono/jsx-renderer'
import { Navigation } from './components/Navigation'
import { Footer } from './components/Footer'

export const renderer = jsxRenderer(({ children }, c) => {
  const currentUser = c.get('user')
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Snow Fleet Management</title>
        <link href="/static/style.css" rel="stylesheet" />
        <link href="/static/login-theme.css" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body>
        <Navigation currentUser={currentUser} />
        <main>{children}</main>
        <Footer />
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})
