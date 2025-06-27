import React, { useState } from "react";
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import Interview from "./components/Interview";
import Result from "./components/Result";
import './App.css';

function App() {
  const [topic, setTopic] = useState("");
  const [start, setStart] = useState(false);
  const [results, setResults] = useState([]);
  const [overall, setOverall] = useState(null);

  // Update to collect both results and overall
  const handleFinish = (resultsArr, overallObj) => {
    setResults(resultsArr);
    setOverall(overallObj);
  };

  return (
    <Container maxWidth="md" className="app-container">
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        InterviewHelper
      </Typography>
      {!start ? (
        <Box className="app-box">
          <TextField
            label="Enter interview topic"
            placeholder="e.g. JavaScript, Marketing"
            variant="outlined"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setStart(true)}
            disabled={!topic}
            size="large"
          >
            Start Interview
          </Button>
        </Box>
      ) : (
        <Interview topic={topic} onFinish={handleFinish} />
      )}
      {results.length > 0 && overall && <Result results={results} overall={overall} />}
    </Container>
  );
}

export default App;
