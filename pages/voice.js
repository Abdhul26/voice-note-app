import React, { useState, useEffect } from 'react'
import axios from 'axios'

const VoiceNote = () => {
  const [transcript, setTranscript] = useState('')
  const [title, setTitle] = useState('') // State for title
  const [listening, setListening] = useState(false)
  const [notes, setNotes] = useState([]) // State for notes

  const handleSpeechRecognition = () => {
    // Check if SpeechRecognition is supported
    if (
      !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    ) {
      alert('Speech recognition not supported in this browser.')
      return
    }

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
    <div style={styles.container}>
      <h1 style={styles.header}>Voice-Controlled Notes App</h1>
      <input
        type='text'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder='Enter note title'
        style={styles.input}
      />
      <p style={styles.transcript}>
        {transcript || 'No speech detected yet...'}
      </p>

      <button onClick={handleSpeechRecognition} style={styles.button}>
        {listening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <button
        onClick={saveNote}
        disabled={!transcript || !title}
        style={styles.button}
      >
        Save Note
      </button>

      {notes.map((note) => (
        <div key={note._id} style={styles.note}>
          <h3 style={styles.noteTitle}>{note.title}</h3>
          <p style={styles.noteContent}>{note.content}</p>
          {/* Add edit and delete button functions if needed */}
        </div>
      ))}
    </div>
  )
}

// Define your styles here
const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  transcript: {
    margin: '10px 0',
    fontStyle: 'italic',
    color: '#555',
  },
  button: {
    padding: '10px 15px',
    margin: '5px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007BFF',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
  },
  note: {
    margin: '10px 0',
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
  },
  noteTitle: {
    margin: '0 0 5px 0',
  },
  noteContent: {
    margin: '0',
  },
}

export default VoiceNote // Ensure this matches your component name
