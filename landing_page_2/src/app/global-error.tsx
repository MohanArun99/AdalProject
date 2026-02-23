'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0a0a0f', color: '#fff', fontFamily: 'system-ui', padding: 24, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: '#9ca3af', marginBottom: 24, textAlign: 'center' }}>{error.message}</p>
        <button
          onClick={() => reset()}
          style={{ padding: '12px 24px', background: 'linear-gradient(to right, #2563eb, #9333ea)', color: 'white', border: 'none', borderRadius: 9999, fontWeight: 500, cursor: 'pointer' }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
