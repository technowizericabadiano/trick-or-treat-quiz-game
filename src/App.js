import React, { useCallback, useEffect, useMemo, useState } from "react";
import GameBoard from "./GameBoard";
import Modal from "./Modal";
import ScoreBoard from "./ScoreBoard";
import StartScreen from "./StartScreen";
import { actionCardsByLanguage } from "./content/localization";
import { useLocalization } from "./LocalizationContext";
import { playerDatabase, playersById, quizzesById, quizSets } from "./gameData";
import { createDeck, playSound, toSafeNumber } from "./gameUtils";
import { useAdminHistory } from "./useAdminHistory";

function App() {
  const { language } = useLocalization();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [cards, setCards] = useState([]);
  const [score, setScore] = useState(0);
  const [activeCardId, setActiveCardId] = useState(null);
  const {
    activityRows,
    adminAccessError,
    adminCodeInput,
    handleAdminCodeChange,
    handleClearPlayerHistory,
    handleExportPlayerHistory,
    handleLockAdminTools,
    handleUnlockAdminTools,
    isAdminUnlocked,
    markPlayerPlayed,
    playedPlayerCount,
    playerHistory,
    totalGamesPlayed,
  } = useAdminHistory(playerDatabase);

  const rawSelectedPlayer = playersById[selectedPlayerId] || null;
  const selectedPlayer = rawSelectedPlayer?.canPlay ? rawSelectedPlayer : null;
  const selectedQuiz = quizzesById[selectedQuizId] || null;
  const activeCard = useMemo(
    () => (activeCardId === null ? null : cards.find((card) => card.id === activeCardId) || null),
    [activeCardId, cards]
  );
  const remaining = cards.filter((card) => card.status === "closed").length;
  const gameOver = remaining === 0;

  const chooseQuiz = useCallback(
    (quizId) => {
      if (!selectedPlayer) return;

      const nextQuiz = quizzesById[quizId];

      if (!nextQuiz) return;

      markPlayerPlayed(selectedPlayer.id, 0, true);
      setSelectedQuizId(quizId);
      setCards(createDeck(language, nextQuiz.questionsByLanguage[language]));
      setScore(0);
      setActiveCardId(null);
    },
    [language, markPlayerPlayed, selectedPlayer]
  );

  const startGame = useCallback(() => {
    if (!selectedQuiz || !selectedPlayer) return;

    markPlayerPlayed(selectedPlayer.id, 0, true);
    setCards(createDeck(language, selectedQuiz.questionsByLanguage[language]));
    setScore(0);
    setActiveCardId(null);
  }, [language, markPlayerPlayed, selectedPlayer, selectedQuiz]);

  useEffect(() => {
    if (gameOver && selectedPlayerId) {
      markPlayerPlayed(selectedPlayerId, score, false);
    }
  }, [gameOver, selectedPlayerId, score, markPlayerPlayed]);

  const leaveQuiz = useCallback(() => {
    setSelectedQuizId(null);
    setCards([]);
    setScore(0);
    setActiveCardId(null);
  }, []);

  const openCard = useCallback((cardId) => {
    playSound("flip");
    setActiveCardId(cardId);
  }, []);

  const closeModal = useCallback(() => {
    setActiveCardId(null);
  }, []);

  const finishCard = useCallback((cardId, resultLabel, scoreChange) => {
    if (cardId === null || cardId === undefined) {
      setActiveCardId(null);
      return;
    }

    const safeScoreChange = toSafeNumber(scoreChange);

    setCards((previousCards) =>
      previousCards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              status: "done",
              resultKey: resultLabel,
            }
          : card
      )
    );
    setScore((previousScore) =>
      Math.max(0, toSafeNumber(previousScore) + safeScoreChange)
    );
    setActiveCardId(null);
  }, []);

  const handleInstantCard = useCallback(
    (card) => {
      if (!card || typeof card !== "object") {
        setActiveCardId(null);
        return;
      }

      const isTreat = card.type === "treat";
      playSound(isTreat ? "treat" : "trick");
      const resultLabel = isTreat ? "bonus" : "trick";
      const points = toSafeNumber(card.points);
      const scoreChange = isTreat ? points : -points;

      finishCard(card.id, resultLabel, scoreChange);
    },
    [finishCard]
  );

  const handleQuestion = useCallback(
    (card, selectedIndex) => {
      if (!card || typeof card !== "object") {
        setActiveCardId(null);
        return;
      }

      const isCorrect = selectedIndex === card.answerIndex;
      playSound(isCorrect ? "correct" : "wrong");
      const resultLabel = isCorrect ? "correct" : "wrong";
      const scoreChange = isCorrect
        ? toSafeNumber(card.points)
        : -toSafeNumber(card.penalty);

      finishCard(card.id, resultLabel, scoreChange);
    },
    [finishCard]
  );

  if (!selectedQuiz) {
    return (
      <main className="app-shell">
        <StartScreen
          actionCardCount={actionCardsByLanguage[language].length}
          adminAccessError={adminAccessError}
          adminCodeInput={adminCodeInput}
          isAdminUnlocked={isAdminUnlocked}
          activityRows={activityRows}
          onAdminCodeChange={handleAdminCodeChange}
          onAdminLock={handleLockAdminTools}
          onAdminUnlock={handleUnlockAdminTools}
          onClearPlayerHistory={handleClearPlayerHistory}
          playerHistory={playerHistory}
          playedPlayerCount={playedPlayerCount}
          players={playerDatabase}
          quizzes={quizSets}
          onExportPlayerHistory={handleExportPlayerHistory}
          onSelectPlayer={setSelectedPlayerId}
          onSelectQuiz={chooseQuiz}
          selectedPlayerId={selectedPlayerId}
          totalGamesPlayed={totalGamesPlayed}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <ScoreBoard
        gameOver={gameOver}
        onBackToMenu={leaveQuiz}
        onReset={startGame}
        playerGroup={selectedPlayer?.group || ""}
        playerName={selectedPlayer?.name || ""}
        quizTitle={selectedQuiz.title[language]}
        remaining={remaining}
        score={score}
        totalCards={cards.length}
      />

      <GameBoard cards={cards} onCardClick={openCard} />

      {activeCard ? (
        <Modal
          card={activeCard}
          onAnswer={handleQuestion}
          onClaim={handleInstantCard}
          onClose={closeModal}
        />
      ) : null}
    </main>
  );
}

export default App;
