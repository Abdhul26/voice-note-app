import React, { useState } from 'react'
import axios from 'axios'

const VoiceNote = () => {
  const [transcript, setTranscript] = useState('')
  const [title, setTitle] = useState('') // State for title
  const [listening, setListening] = useState(false)

  const handleSpeechRecognition = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)()

    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
    }

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript
      setTranscript(speechToText)
      setListening(false)
    }

    recognition.onerror = (event) => {
      console.error(event.error)
      setListening(false)
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

    // Define a title for the note, you can customize this logic as needed
    const title = 'Voice Note'

    try {
      const response = await axios.post('http://localhost:5000/notes', {
        title: title,
        content: transcript,
      })
      if (response.status === 201) {
        console.log('Note saved:', response.data)
        setTranscript('') // Clear the transcript after saving
      }
    } catch (error) {
      console.error('Error saving note:', error.message) // Log the error message
    }
  }

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
    </div>
  )
}

export default VoiceNote
