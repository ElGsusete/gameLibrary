import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

import express from 'express'
import cors from 'cors'
import passport from 'passport'
import { Strategy as SteamStrategy } from 'passport-steam'
import jwt from 'jsonwebtoken'

export const PORT = process.env.PORT || 3001
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`
const STEAM_API_KEY = process.env.STEAM_API_KEY || ''
export const JWT_SECRET = process.env.JWT_SECRET || 'gamelog-dev-secret-change-in-production'

const app = express()
app.use(cors({ origin: FRONTEND_URL, credentials: true }))
app.use(passport.initialize())

if (STEAM_API_KEY) {
  passport.use(
    new SteamStrategy(
      {
        returnURL: `${BACKEND_URL}/api/auth/steam/callback`,
        realm: BACKEND_URL,
        apiKey: STEAM_API_KEY,
      },
      (identifier, profile, done) => {
        profile.steamId = profile.id || profile._json?.steamid
        return done(null, profile)
      }
    )
  )
}

app.get('/api/auth/steam', (req, res, next) => {
  if (!STEAM_API_KEY) {
    return res.redirect(`${FRONTEND_URL}/?auth=error&reason=no_api_key`)
  }
  passport.authenticate('steam', { session: false })(req, res, next)
})

app.get('/api/auth/steam/callback', (req, res, next) => {
  if (!STEAM_API_KEY) {
    return res.redirect(`${FRONTEND_URL}/?auth=error&reason=no_api_key`)
  }
  passport.authenticate('steam', { session: false }, (err, user) => {
    if (err) {
      console.error('Steam auth callback error:', err)
      return res.redirect(`${FRONTEND_URL}/?auth=error`)
    }
    const steamId = user?.id || user?.steamId
    if (!steamId) return res.redirect(`${FRONTEND_URL}/?auth=error`)
    const token = jwt.sign({ steamId }, JWT_SECRET, { expiresIn: '7d' })
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`)
  })(req, res, next)
})

app.get('/api/me/games', async (req, res) => {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'No token' })
  }
  let steamId
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    steamId = payload.steamId
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
  if (!STEAM_API_KEY) {
    return res.status(503).json({
      error: 'Steam API key not configured. Set STEAM_API_KEY in server/.env',
    })
  }
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=1&format=json`
  try {
    const r = await fetch(url)
    const data = await r.json()
    const games = data.response?.games || []
    res.json({ games })
  } catch (e) {
    res.status(502).json({ error: 'Steam API error' })
  }
})

export default app
