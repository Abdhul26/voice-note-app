const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
mongoose.set('debug', true)
app.use(cors())
app.use(bodyParser.json()) // Ensure this is placed before your routes

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const Note = mongoose.model('Note', noteSchema)

// Adding a new note
app.post('/notes', async (req, res) => {
  try {
    console.log(req.body) // Log the request body for debugging
    const { title, content } = req.body
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' })
    }
    const note = new Note({ title, content })
    await note.save()
    res.status(201).json(note)
  } catch (error) {
    console.error('Error creating note:', error) // Log the error for debugging
    res.status(500).json({ message: 'Error creating note', error })
  }
})

// Retrieving all notes
app.get('/notes', async (req, res) => {
  try {
    const notes = await Note.find()
    res.status(200).json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error) // Log the error to the console
    res.status(500).json({ message: 'Error fetching notes', error })
  }
})

// Update a note
app.put('/notes/:id', async (req, res) => {
  try {
    const { title, content } = req.body
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    )
    res.status(200).json(note)
  } catch (error) {
    console.error('Error updating note:', error) // Log the error to the console
    res.status(500).json({ message: 'Error updating note', error })
  }
})

// Delete a note
app.delete('/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting note:', error) // Log the error to the console
    res.status(500).json({ message: 'Error deleting note', error })
  }
})

app.get('/', (req, res) => {
  res.send('Hello, this is the Voice-Controlled Notes App server!')
})

const mongoURI = process.env.MONGO_URI

mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => console.error('MongoDB connection error:', err))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
