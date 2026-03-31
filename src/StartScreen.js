import React, { memo } from "react";
import { useLocalization } from "./LocalizationContext";

const PlayerCard = memo(function PlayerCard({
  historyEntry,
  isLocked,
  isSelected,
  onSelectPlayer,
  player,
}) {
  const { copy, language } = useLocalization();
  const formattedLastPlayed = historyEntry?.lastPlayedAt
    ? new Intl.DateTimeFormat(language === "tl" ? "fil-PH" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(historyEntry.lastPlayedAt))
    : "";

  return (
    <button
      type="button"
      className={`player-card ${isSelected ? "is-active" : ""} ${
        isLocked ? "is-locked" : ""
      }`}
      disabled={isLocked}
      aria-pressed={isSelected}
      onClick={() => onSelectPlayer(player.id)}
      style={{ touchAction: "manipulation" }}
    >
      <div className="player-card-header">
        <span className="player-card-name">{player.name}</span>
        <span className="player-card-group">{player.group}</span>
      </div>
      <span className="player-card-note">{player.note}</span>
      {historyEntry?.highScore > 0 && (
        <span className="player-card-history" style={{ color: "var(--accent)" }}>
          {copy.playerHighScore(historyEntry.highScore)}
        </span>
      )}
      <span className="player-card-history">
        {historyEntry
          ? copy.playerPlayCount(historyEntry.playCount)
          : copy.playerNeverPlayed}
      </span>
      {formattedLastPlayed ? (
        <span className="player-card-last-played">
          {copy.playerLastPlayed(formattedLastPlayed)}
        </span>
      ) : null}
      <span className={`player-card-status ${isLocked ? "locked" : "ready"}`}>
        {isLocked ? copy.playerLocked : copy.playerReady}
      </span>
    </button>
  );
});

const QuizOption = memo(function QuizOption({
  actionCardCount,
  disabled,
  onSelectQuiz,
  quiz,
}) {
  const { copy, language } = useLocalization();
  return (
    <button
      type="button"
      className="quiz-option"
      disabled={disabled}
      onClick={() => onSelectQuiz(quiz.id)}
      style={{ touchAction: "manipulation" }}
    >
      <span className="quiz-option-label">{quiz.title[language]}</span>
      <span className="quiz-option-copy">{quiz.description[language]}</span>
      <span className="quiz-option-meta">
        {copy.questionSummary(
          quiz.questionsByLanguage[language].length,
          actionCardCount
        )}
      </span>
    </button>
  );
});

const ActivityRow = memo(function ActivityRow({ entry }) {
  const { copy, language } = useLocalization();
  const formattedLastPlayed = new Intl.DateTimeFormat(
    language === "tl" ? "fil-PH" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(entry.lastPlayedAt));

  return (
    <article className="activity-row">
      <div className="activity-row-main">
        <strong className="activity-player-name">{entry.name}</strong>
        <span className="activity-player-group">{entry.group}</span>
      </div>
      <div className="activity-row-meta">
        <span className="activity-play-count">{copy.playerPlayCount(entry.playCount)}</span>
        {entry.highScore > 0 && (
          <span className="activity-play-count">{copy.playerHighScore(entry.highScore)}</span>
        )}
        <span className="activity-last-played">
          {copy.playerLastPlayed(formattedLastPlayed)}
        </span>
      </div>
    </article>
  );
});

const StartScreen = memo(function StartScreen({
  actionCardCount,
  adminAccessError,
  adminCodeInput,
  activityRows,
  isAdminUnlocked,
  onAdminCodeChange,
  onAdminLock,
  onAdminUnlock,
  onClearPlayerHistory,
  onExportPlayerHistory,
  playerHistory,
  playedPlayerCount,
  players,
  quizzes,
  onSelectPlayer,
  onSelectQuiz,
  selectedPlayerId,
  totalGamesPlayed,
}) {
  const { copy, language, setLanguage } = useLocalization();
  const firstQuiz = quizzes[0];
  const questionCount = firstQuiz
    ? firstQuiz.questionsByLanguage[language].length
    : 0;
  const playablePlayerCount = players.reduce(
    (count, player) => count + (player.canPlay ? 1 : 0),
    0
  );
  const selectedPlayer =
    players.find((player) => player.id === selectedPlayerId && player.canPlay) || null;
  const canStartQuiz = Boolean(selectedPlayer);

  return (
    <section className="start-screen">
      <div className="start-toolbar">
        <div className="start-intro">
          <p className="eyebrow">{copy.startEyebrow}</p>
          <h1>{copy.startTitle}</h1>
          <p className="start-copy">{copy.startCopy}</p>

          <div className="start-highlights">
            <span className="start-highlight">{copy.questionChip(questionCount)}</span>
            <span className="start-highlight">{copy.treatChip}</span>
            <span className="start-highlight">{copy.trickChip}</span>
          </div>
        </div>

        <div className="language-picker" role="group" aria-label={copy.languageLabel}>
          <span className="language-label">{copy.languageLabel}</span>
          <div className="language-buttons">
            {["en", "tl"].map((option) => (
              <button
                key={option}
                type="button"
                className={`language-button ${language === option ? "is-active" : ""}`}
                onClick={() => setLanguage(option)}
              >
                {copy.languages[option]}
              </button>
            ))}
          </div>
          <p className="language-hint">{copy.languageHint}</p>
        </div>
      </div>

      <section className="player-section" aria-labelledby="player-section-title">
        <div className="player-section-header">
          <div>
            <p className="eyebrow">{copy.playerEyebrow}</p>
            <h2 id="player-section-title" className="section-title">
              {copy.playerTitle}
            </h2>
          </div>
        </div>

        <div className="player-grid">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              historyEntry={playerHistory[player.id]}
              isLocked={!player.canPlay}
              isSelected={player.id === selectedPlayerId}
              onSelectPlayer={onSelectPlayer}
              player={player}
            />
          ))}
        </div>

        <p className="player-selection-status">
          {selectedPlayer
            ? copy.playerSelected(selectedPlayer.name)
            : playablePlayerCount
            ? copy.playerHint
            : copy.playerEmpty}
        </p>
      </section>

      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <QuizOption
            key={quiz.id}
            actionCardCount={actionCardCount}
            disabled={!canStartQuiz}
            onSelectQuiz={onSelectQuiz}
            quiz={quiz}
          />
        ))}
      </div>

      <section className="activity-section" aria-labelledby="activity-section-title">
        <div className="activity-section-header">
          <div>
            <p className="eyebrow">{copy.activityEyebrow}</p>
            <h2 id="activity-section-title" className="section-title">
              {copy.activityTitle}
            </h2>
          </div>
          <p className="player-section-copy">{copy.activityCopy}</p>
        </div>

        <div className="activity-summary-grid">
          <div className="activity-summary-card">
            <span className="activity-summary-label">{copy.playedPlayersLabel}</span>
            <strong className="activity-summary-value">{playedPlayerCount}</strong>
          </div>
          <div className="activity-summary-card">
            <span className="activity-summary-label">{copy.totalGamesLabel}</span>
            <strong className="activity-summary-value">{totalGamesPlayed}</strong>
          </div>
        </div>

        <div className="activity-actions">
          {isAdminUnlocked ? (
            <>
              <span className="admin-status">{copy.adminUnlocked}</span>
              <button
                type="button"
                className="menu-button"
                onClick={onExportPlayerHistory}
              >
                {copy.exportHistory}
              </button>
              <button
                type="button"
                className="menu-button"
                onClick={onClearPlayerHistory}
              >
                {copy.clearHistory}
              </button>
              <button
                type="button"
                className="menu-button"
                onClick={onAdminLock}
              >
                {copy.lockAdminTools}
              </button>
            </>
          ) : null}
        </div>

        {!isAdminUnlocked ? (
          <form
            className="admin-access-form"
            onSubmit={(event) => {
              event.preventDefault();
              onAdminUnlock();
            }}
          >
            <label className="admin-access-label" htmlFor="admin-access-code">
              {copy.adminCodeLabel}
            </label>
            <div className="admin-access-row">
              <input
                id="admin-access-code"
                type="password"
                className="admin-access-input"
                value={adminCodeInput}
                autoComplete="current-password"
                placeholder={copy.adminCodePlaceholder}
                onChange={(event) => onAdminCodeChange(event.target.value)}
              />
              <button type="submit" className="reset-button">
                {copy.unlockAdminTools}
              </button>
            </div>
            <p className="admin-access-copy">{copy.adminAccessCopy}</p>
            {adminAccessError ? (
              <p className="admin-access-error">{copy.adminAccessError}</p>
            ) : null}
          </form>
        ) : null}

        {activityRows.length ? (
          <div className="activity-list">
            {activityRows.map((entry) => (
              <ActivityRow
                key={entry.id}
                entry={entry}
              />
            ))}
          </div>
        ) : (
          <p className="activity-empty">{copy.activityEmpty}</p>
        )}
      </section>
    </section>
  );
});

export default StartScreen;
