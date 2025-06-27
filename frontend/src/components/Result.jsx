import React from "react";
import './Result.css';

export default function Result({ results, overall }) {
  return (
    <div style={{ marginTop: 40 }}>
      <h2>Interview Results</h2>
      {overall && (
        <div className="overall-grade">
          <strong>Overall Grade: </strong>
          <span className="grade-score">{overall.score} / 10</span>
          {/* <div className="overall-summary" style={{ marginTop: 8, color: "#333", fontStyle: "italic" }}>
            {overall.summary}
          </div> */}
        </div>
      )}
      {results.map((r, idx) => (
        <div key={idx} className="result-card">
          <strong>Q{idx + 1}: {r.question}</strong>
          <br />
          <em>Your answer:</em> {r.answer}
          <br />
          <em>AI Feedback:</em>
          <div className="result-container">{r.analysis}</div>
        </div>
      ))}
    </div>
  );
}
