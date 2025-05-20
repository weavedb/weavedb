import express from "express"
import cors from "cors"

const port = 5000
const app = express()

app.use(cors())
const raw = (req, res, next) => {
  if (req.body) return next()
  if (req.method !== "POST") return next()
  const chunks = []
  let bodyLength = 0
  req.on("data", chunk => {
    chunks.push(chunk)
    bodyLength += chunk.length
  })

  req.on("end", () => {
    req.rawBody = Buffer.concat(chunks, bodyLength)
    next()
  })
}
app.use(raw)

app.post("/abc/schedule", (req, res) => {
  console.log(req.headers)
  console.log(req.rawBody)
  res.json({ headers: req.headers, body: req.rawBody.toString("base64") })
})

const node = app.listen(port, () => console.log(`WeaveDB on port ${port}`))
