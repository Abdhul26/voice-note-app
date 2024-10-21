const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
require('dotenv').config()

app.use(cors())
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.send('Hello, this is the Voice-Controlled Notes App server!')
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
