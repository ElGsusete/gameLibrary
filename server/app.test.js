import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app, { JWT_SECRET } from './app.js'
import jwt from 'jsonwebtoken'

describe('API /api/me/games', () => {
  it('returns 401 when no token', async () => {
    const res = await request(app).get('/api/me/games')
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'No token' })
  })
  it('returns 401 when token is invalid', async () => {
    const res = await request(app)
      .get('/api/me/games')
      .set('Authorization', 'Bearer invalid-token')
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Invalid token' })
  })
  it('accepts valid JWT and returns 503, 502, or 200 depending on Steam API', async () => {
    const token = jwt.sign({ steamId: '12345' }, JWT_SECRET, { expiresIn: '1h' })
    const res = await request(app)
      .get('/api/me/games')
      .set('Authorization', `Bearer ${token}`)
    expect([200, 502, 503]).toContain(res.status)
    if (res.status === 503) expect(res.body.error).toMatch(/STEAM_API_KEY/)
    if (res.status === 502) expect(res.body.error).toBe('Steam API error')
    if (res.status === 200) expect(res.body).toHaveProperty('games')
  })
})

describe('API /api/auth/steam', () => {
  it('returns error response when no Steam API key or passport fails', async () => {
    const res = await request(app).get('/api/auth/steam').redirects(0)
    expect([302, 500]).toContain(res.status)
    if (res.status === 302) {
      expect(res.headers.location).toMatch(/auth=error&reason=no_api_key/)
    }
  })
})
