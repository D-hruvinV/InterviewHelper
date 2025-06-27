import React, { useRef, useState } from "react";
import './VoiceRecorder.css';

export default function VoiceRecorder({ setAnswer, resetSignal }) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const shouldRestart = useRef(false);

  React.useEffect(() => {
    if (isRecording) {
      stopRecognition();
    }
    // eslint-disable-next-line
  }, [resetSignal]);

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };

    recognition.onend = () => {
      if (shouldRestart.current) {
        recognition.start();
      } else {
        setIsRecording(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      shouldRestart.current = false;
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    shouldRestart.current = true;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecognition = () => {
    shouldRestart.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent auto-restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  return (
    <div style={{ marginBottom: 10 }}>
      <button
        className={`voice-recorder-btn${isRecording ? " recording" : ""}`}
        onClick={isRecording ? stopRecognition : startRecognition}
      >
        {isRecording ? "Stop Recording" : "🎤 Record Answer"}
      </button>
    </div>
  );
}
