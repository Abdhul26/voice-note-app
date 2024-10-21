import React, { useState } from 'react'

const VoiceNote = () => {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)

  const handleSpeechRecognition = () => {
    console.log(window.SpeechRecognition)
    console.log(window.webkitSpeechRecognition)

    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)()

    console.log({ recognition })

    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
    }

    recognition.onresult = (event) => {
      console.log(event)

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
    console.log(`Listening state: ${listening}`)
    listening ? recognition.stop() : recognition.start()
  }

  return (
    <div>
      <h1>Voice-Controlled Notes App</h1>
      <p>{transcript || 'No speech detected yet...'}</p>
      <button onClick={handleSpeechRecognition}>
        {listening ? 'Stop Listening' : 'Start Listening'}
      </button>
    </div>
  )
}

export default VoiceNote
