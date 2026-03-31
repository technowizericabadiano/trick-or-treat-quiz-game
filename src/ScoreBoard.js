import React, { memo } from "react";
import { useLocalization } from "./LocalizationContext";
import { ghostArt, treatArt, trickGhostArt } from "./pptThemeAssets";

function StatBox({ label, value }) {
  return (
    <div className="stat-box">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
    </div>
  );
}

const ScoreBoard = memo(function ScoreBoard({
  gameOver,
  onBackToMenu,
  onReset,
  playerGroup,
  playerName,
  quizTitle,
  remaining,
  score,
  totalCards,
}) {
  const { copy } = useLocalization();

  return (
    <header className="score-board">
      <div className="score-illustration" aria-hidden="true">
        <img className="score-ghost" src={ghostArt} alt="" />
        <img className="score-illustration-accent treat" src={treatArt} alt="" />
        <img className="score-illustration-accent trick" src={trickGhostArt} alt="" />
      </div>

      <div className="title-block">
        <p className="eyebrow">{quizTitle}</p>
        <h1>{copy.gameTitle}</h1>
        <p className="subtitle">{copy.subtitle}</p>
        <div className="player-banner">
          <span className="player-banner-label">{copy.playerLabel}</span>
          <strong>{copy.playerSummary(playerName, playerGroup)}</strong>
        </div>
      </div>

      <div className="score-side">
        <div className="stats-row">
          <StatBox label={copy.scoreLabel} value={score} />
          <StatBox label={copy.cardsLeftLabel} value={remaining} />
        </div>

        <div className="score-actions">
          <div className="action-row">
            <button type="button" className="reset-button" onClick={onReset}>
              {gameOver ? copy.playAgain : copy.restart}
            </button>
            <button type="button" className="menu-button" onClick={onBackToMenu}>
              {copy.changeQuiz}
            </button>
          </div>
          <p className="status-text">
            {gameOver ? copy.boardComplete : copy.totalCardsLabel(totalCards)}
          </p>
        </div>
      </div>
    </header>
  );
});

export default ScoreBoard;
