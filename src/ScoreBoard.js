import React from "react";

function ScoreChip({ label, value }) {
  return (
    <div className="score-chip-box">
      <span className="score-chip-label">{label}</span>
      <strong className="score-chip-value">{value}</strong>
    </div>
  );
}

function ScoreBoard({ combo, gameOver, onReset, remaining, score, stats }) {
  return (
    <header className="score-board">
      <div className="score-brand">
        <h1>Trick or Treat</h1>
        <p>Pick a pumpkin, face the surprise, and clear the board.</p>
      </div>

      <div className="score-chip-row">
        <ScoreChip label="Points" value={score} />
        <ScoreChip label="Left" value={remaining} />
        <ScoreChip label="Correct" value={stats.correct} />
        <ScoreChip label="Streak" value={combo} />
      </div>

      <div className="score-actions">
        <button type="button" className="board-reset-button" onClick={onReset}>
          {gameOver ? "Play Again" : "Shuffle Board"}
        </button>
        {gameOver ? (
          <div className="game-over-banner">Final score: {score}. Board cleared.</div>
        ) : null}
      </div>
    </header>
  );
}

export default ScoreBoard;
