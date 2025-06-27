// index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Global error handlers for debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY not set in .env');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Health check
app.get('/', (req, res) => {
  res.send('Gemini Interview API is running.');
});

// Gemini API call utility with robust error handling
async function generateGeminiResponse(prompt) {
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Use the supported Gemini model
      contents: prompt, // Pass prompt as a string
    });
    if (result && result.text) {
      return result.text;
    } else {
      console.error('Gemini API: No text in response:', result);
      throw new Error('No text in Gemini response');
    }
  } catch (err) {
    console.error('Gemini API error:', err);
    throw new Error('Gemini API call failed');
  }
}

// Progressive, concise, adaptive question generation
app.post('/api/generate-question', async (req, res) => {
  try {
    const { topic, history, lastAnswer } = req.body;
    const numQuestions = history ? history.length : 0;

    let prompt = `
You are an expert interviewer for the topic "${topic}".
Your job is to ask concise, focused questions (1-2 sentences each).
Start with the most basic, fundamental question about "${topic}".
With each next question, increase the depth and complexity slightly, based on the candidate's previous answers and the conversation so far.

Rules:
- Begin with simple, beginner-level questions.
- Gradually move to intermediate, then advanced questions.
- Each question should be short and clear.
- Use the candidate's last answer to tailor the next question.
- Only ask one question at a time.

This is question number ${numQuestions + 1}.

Conversation so far:
`;

    if (history && history.length) {
      history.forEach((h, idx) => {
        prompt += `Q${idx + 1}: ${h.question}\nA${idx + 1}: ${h.answer}\n`;
      });
    }

    if (lastAnswer) {
      prompt += `\nThe candidate's last answer was: "${lastAnswer}"\n`;
    }

    prompt += `
Now, ask the next question for the interview as described above.
`;

    const question = await generateGeminiResponse(prompt);
    res.json({ question: question.trim() });
  } catch (err) {
    console.error('Error in /api/generate-question:', err);
    res.status(500).json({ error: 'Failed to generate question.' });
  }
});

//overall grade
app.post('/api/overall-grade', async (req, res) => {
  try {
    const { history } = req.body;
    const prompt = `
You are an expert interviewer. Here is a list of questions and the candidate's answers:

${history.map((h, idx) => `Q${idx + 1}: ${h.question}\nA${idx + 1}: ${h.answer}`).join('\n')}

Please:
- Give an overall score out of 10 for the candidate's performance.
- Write "Overall Score: X/10" on a new line.
- Provide a brief summary of strengths and areas for improvement.
`;

    const result = await generateGeminiResponse(prompt);
    // Extract score using regex
    const scoreMatch = result.match(/Overall Score:\s*(\d+)\/10/i);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
    res.json({ summary: result.trim(), score });
  } catch (err) {
    console.error('Error in /api/overall-grade:', err);
    res.status(500).json({ error: 'Failed to generate overall grade.' });
  }
});


// evaluation
app.post('/api/analyze-answer', async (req, res) => {
  try {
    const { question, answer } = req.body;
    const prompt = `
You are an expert interviewer.
Evaluate the following answer for correctness, clarity, and completeness.

Question: "${question}"
Answer: "${answer}"

Instructions:
- Is the answer correct? If not, explain why.
- Is the answer clear and easy to understand?
- Is the answer complete, or is anything important missing?
- Give a score out of 10 for overall quality.
- Suggest specific improvements if needed.
- Provide a model answer for reference.
`;

    const analysis = await generateGeminiResponse(prompt);
    res.json({ analysis: analysis.trim() });
  } catch (err) {
    console.error('Error in /api/analyze-answer:', err);
    res.status(500).json({ error: 'Failed to analyze answer.' });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
