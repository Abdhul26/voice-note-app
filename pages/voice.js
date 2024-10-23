import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './VoiceNote.css'

const VoiceNote = () => {
  const [transcript, setTranscript] = useState('')
  const [title, setTitle] = useState('') // State for title
  const [listening, setListening] = useState(false)
  const [notes, setNotes] = useState([]) // State for notes

  const handleSpeechRecognition = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)()
    recognition.lang = 'en-US'
    recognition.interimResults = true // Enable live transcription
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
      console.log('Listening...')
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      // Loop through the results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript // Final transcript
        } else {
          interimTranscript += event.results[i][0].transcript // Interim transcript
        }
      }

      // Show the interim transcript while still recognizing speech
      setTranscript(interimTranscript || finalTranscript) // Update the transcript live

      // Automatically save note if user says "save note"
      if (finalTranscript.toLowerCase().includes('save note')) {
        saveNote()
      }
    }

    recognition.onend = () => {
      setListening(false)
    }

    listening ? recognition.stop() : recognition.start()
  }

  const saveNote = async () => {
    if (!transcript) {
      alert('Please speak something before saving!')
      return
    }

    // Define a title for the note
    const noteTitle = title || 'Voice Note' // Use user-provided title or default

    try {
      const response = await axios.post('http://localhost:5000/notes', {
        title: noteTitle,
        content: transcript,
      })
      if (response.status === 201) {
        console.log('Note saved:', response.data)
        setTranscript('') // Clear the transcript after saving
        setTitle('') // Clear the title after saving
        fetchNotes() // Refresh notes
      }
    } catch (error) {
      console.error('Error saving note:', error.message) // Log the error message
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/notes')
      setNotes(response.data)
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  useEffect(() => {
    fetchNotes() // Fetch notes when component mounts
  }, [])

  return (
    <div>
      <h1>Voice-Controlled Notes App</h1>
      <input
        type='text'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder='Enter note title'
      />
      <p>{transcript || 'No speech detected yet...'}</p>

      <button onClick={handleSpeechRecognition}>
        {listening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <button onClick={saveNote} disabled={!transcript || !title}>
        Save Note
      </button>

      {notes.map((note) => (
        <div key={note._id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          <button onClick={() => editNote(note._id)}>Edit</button>
          <button onClick={() => deleteNote(note._id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}

export default VoiceNote
