import React, { useState } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, CircularProgress, Paper } from '@mui/material';
import VoiceRecorder from "./VoiceRecorder";
import './Interview.css';

const MAX_QUESTIONS = 7;

export default function Interview({ topic, onFinish }) {
  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [analysis, setAnalysis] = useState("");
  const [resetSignal, setResetSignal] = useState(0);

  // New: overall grade state
  const [overall, setOverall] = useState(null);

  React.useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line
  }, []);

  const generateQuestion = async (lastAnswer = "") => {
    setLoading(true);
    const res = await axios.post(`${import.meta.env.REACT_APP_BACKEND_URL}/api/generate-question`, {
      topic,
      history,
      lastAnswer
    });
    setQuestion(res.data.question.trim());
    setAnalysis("");
    setAnswer("");
    setResetSignal(prev => prev + 1);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await axios.post(`${import.meta.env.REACT_APP_BACKEND_URL}/api/analyze-answer`, {
      question,
      answer,
    });
    const newResult = { question, answer, analysis: res.data.analysis };
    const newResults = [...results, newResult];
    setResults(newResults);
    const newHistory = [...history, { question, answer }];
    setHistory(newHistory);
    setStep(step + 1);
    setLoading(false);

    if (step + 1 < MAX_QUESTIONS) {
      generateQuestion(answer);
    } else {
      // After last question, get overall grade from AI
      setLoading(true);
      const overallRes = await axios.post(`${import.meta.env.REACT_APP_BACKEND_URL}/api/overall-grade`, {
        history: newHistory
      });
      setOverall(overallRes.data);
      setLoading(false);
      onFinish(newResults, overallRes.data); // pass both to Result
    }
  };

  if (loading) return <Box className="interview-loading"><CircularProgress /></Box>;
  if (step >= MAX_QUESTIONS && overall)
    return <Typography variant="h6" align="center" sx={{ mt: 4 }}>Interview complete!</Typography>;

  return (
    <Paper className="interview-paper">
      <Typography variant="h5" gutterBottom>Question {step + 1}:</Typography>
      <Typography variant="body1" className="interview-question">{question}</Typography>
      <VoiceRecorder setAnswer={setAnswer} resetSignal={resetSignal} />
      <TextField
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        multiline
        rows={4}
        fullWidth
        placeholder="Type your answer or use voice..."
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={!answer}
        fullWidth
      >
        Submit Answer
      </Button>
      {analysis && (
        <Paper variant="outlined" className="interview-analysis">
          <Typography variant="subtitle1" gutterBottom>AI Feedback:</Typography>
          <Typography variant="body2" component="pre">{analysis}</Typography>
        </Paper>
      )}
    </Paper>
  );
}
