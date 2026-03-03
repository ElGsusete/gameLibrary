import app, { PORT } from './app.js'

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
