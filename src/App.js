import React, { useCallback, useEffect, useRef, useState } from "react";
import GameBoard from "./GameBoard";
import Modal from "./Modal";
import ScoreBoard from "./ScoreBoard";
import "./App.css";

const deckTemplate = [
  { type: "penalty", text: "Lose half your points!", penaltyType: "loseHalf" },
  { type: "reward", text: "Gain 25 points!", value: 25 },
  {
    type: "question",
    text: "Which keyword creates a constant in JavaScript?",
    options: ["var", "let", "const", "value"],
    correctOptionIndex: 2,
    points: 10,
  },
  {
    type: "challenge",
    layout: "line",
    prompt: "Type the missing word linked to these clues.",
    clues: { left: "Jack", right: "Lantern" },
    answer: "pumpkin",
    points: 12,
  },
  { type: "reward", text: "Gain 20 points!", value: 20 },
  {
    type: "question",
    text: "What hook runs side effects in React?",
    options: ["useState", "useEffect", "useRef", "useValue"],
    correctOptionIndex: 1,
    points: 10,
  },
  { type: "penalty", text: "Lose all your points!", penaltyType: "loseAll" },
  {
    type: "challenge",
    layout: "bridge",
    prompt: "Type the word that connects these clues.",
    clues: { top: "Witch", left: "Spell", right: "Potion" },
    answer: "magic",
    points: 12,
  },
  {
    type: "question",
    text: "Which tag style lets JavaScript render HTML-like markup?",
    options: ["CSS", "JSON", "JSX", "XML"],
    correctOptionIndex: 2,
    points: 10,
  },
  { type: "reward", text: "Gain 15 points!", value: 15 },
  {
    type: "challenge",
    layout: "cross",
    prompt: "Type the word that fits every clue.",
    clues: { top: "Costume", left: "Candy", right: "Ghost", bottom: "October" },
    answer: "halloween",
    points: 14,
  },
  {
    type: "question",
    text: "What do we call a reusable piece of UI in React?",
    options: ["Reducer", "Component", "Resolver", "Portal"],
    correctOptionIndex: 1,
    points: 10,
  },
  { type: "penalty", text: "Lose half your points!", penaltyType: "loseHalf" },
  { type: "reward", text: "Gain 30 points!", value: 30 },
  {
    type: "challenge",
    layout: "prompt",
    text: "Type the hidden word exactly: trickortreat",
    answer: "trickortreat",
    points: 12,
  },
  {
    type: "question",
    text: "Which array method returns a new list after transforming each item?",
    options: ["map", "find", "push", "join"],
    correctOptionIndex: 0,
    points: 10,
  },
  { type: "penalty", text: "Lose all your points!", penaltyType: "loseAll" },
  {
    type: "challenge",
    layout: "line",
    prompt: "Type the missing word linked to these clues.",
    clues: { left: "Moon", right: "Stars" },
    answer: "night",
    points: 12,
  },
  { type: "reward", text: "Gain 10 points!", value: 10 },
  {
    type: "question",
    text: "Which operator checks both value and type equality?",
    options: ["==", "=>", "===", "!="],
    correctOptionIndex: 2,
    points: 10,
  },
];

function shuffleArray(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  }
  return copy;
}

function buildDeck() {
  return shuffleArray(deckTemplate).map((card, index) => ({
    ...card,
    id: index + 1,
    status: "closed",
  }));
}

function playTone(frequency, duration, type = "sine", delay = 0, volume = 0.08) {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return;

  const audioContext = new AudioContextCtor();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const startTime = audioContext.currentTime + delay;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  gainNode.gain.setValueAtTime(volume, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);

  window.setTimeout(() => {
    audioContext.close().catch(() => {});
  }, Math.ceil((delay + duration + 0.1) * 1000));
}

function playFlipSound() {
  playTone(520, 0.08, "square", 0, 0.05);
}

function playCorrectTone() {
  playTone(660, 0.14, "triangle", 0, 0.06);
  playTone(880, 0.18, "triangle", 0.12, 0.06);
}

function playWrongTone() {
  playTone(240, 0.24, "sawtooth", 0, 0.07);
}

function playRewardSound() {
  playTone(740, 0.12, "triangle", 0, 0.06);
  playTone(990, 0.12, "triangle", 0.1, 0.06);
  playTone(1240, 0.16, "triangle", 0.2, 0.06);
}

function App() {
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const trickSoundRef = useRef(null);

  const playCorrectSound = useCallback(() => {
    const correctSound = correctSoundRef.current;

    if (!correctSound) {
      playCorrectTone();
      return;
    }

    correctSound.currentTime = 0;
    correctSound.play().catch(() => {
      playCorrectTone();
    });
  }, []);

  const playWrongSound = useCallback(() => {
    const wrongSound = wrongSoundRef.current;

    if (!wrongSound) {
      playWrongTone();
      return;
    }

    wrongSound.currentTime = 0;
    wrongSound.play().catch(() => {
      playWrongTone();
    });
  }, []);

  const playTrickSound = useCallback(() => {
    const trickSound = trickSoundRef.current;

    if (!trickSound) {
      playWrongTone();
      return;
    }

    trickSound.currentTime = 0;
    trickSound.play().catch(() => {
      playWrongTone();
    });
  }, []);

  const startGame = useCallback(() => {
    setCards(buildDeck());
    setScore(0);
    setActiveCard(null);
    setGameOver(false);
    setCombo(0);
    setStats({ correct: 0, wrong: 0 });
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const handleCardClick = useCallback(
    (cardId) => {
      if (gameOver) return;

      const selectedCard = cards.find((card) => card.id === cardId);
      if (!selectedCard || selectedCard.status !== "closed") return;

      playFlipSound();
      if (selectedCard.type === "penalty") {
        window.setTimeout(() => {
          playTrickSound();
        }, 120);
      }
      setActiveCard(selectedCard);
      setCards((previousCards) =>
        previousCards.map((card) =>
          card.id === cardId ? { ...card, status: "active" } : card
        )
      );
    },
    [cards, gameOver, playTrickSound]
  );

  const handleCloseModal = useCallback(() => {
    if (!activeCard) return;

    setCards((previousCards) =>
      previousCards.map((card) =>
        card.id === activeCard.id && card.status === "active"
          ? { ...card, status: "closed" }
          : card
      )
    );
    setActiveCard(null);
  }, [activeCard]);

  const applyResult = useCallback(
    ({ card, success = false }) => {
      let updatedScore = score;
      let updatedCombo = combo;
      let updatedStats = { ...stats };
      let nextStatus = "closed";

      if (card.type === "question" || card.type === "challenge") {
        if (success) {
          playCorrectSound();
          updatedScore += card.points;
          updatedCombo += 1;
          updatedStats.correct += 1;
          nextStatus = "correct";
        } else {
          playWrongSound();
          updatedScore = Math.max(0, updatedScore - Math.round(card.points / 2));
          updatedCombo = 0;
          updatedStats.wrong += 1;
          nextStatus = "wrong";
        }
      } else if (card.type === "reward") {
        playRewardSound();
        updatedScore += card.value;
        updatedCombo += 1;
        nextStatus = "reward";
      } else if (card.type === "penalty") {
        updatedScore =
          card.penaltyType === "loseAll" ? 0 : Math.floor(updatedScore / 2);
        updatedCombo = 0;
        nextStatus = "penalty";
      }

      setScore(updatedScore);
      setCombo(updatedCombo);
      setStats(updatedStats);
      setActiveCard(null);
      setCards((previousCards) => {
        const nextCards = previousCards.map((currentCard) =>
          currentCard.id === card.id
            ? {
                ...currentCard,
                status: nextStatus,
              }
            : currentCard
        );

        setGameOver(!nextCards.some((currentCard) => currentCard.status === "closed"));
        return nextCards;
      });
    },
    [combo, score, stats]
  );

  const remainingCards = cards.filter((card) => card.status === "closed").length;
  const baseUrl = process.env.PUBLIC_URL;

  return (
    <div className="app-shell">
      <audio ref={correctSoundRef} src={`${baseUrl}/sounds/answer-correct.mp3`} preload="auto" />
      <audio ref={wrongSoundRef} src={`${baseUrl}/sounds/wrong-answer.mp3`} preload="auto" />
      <audio ref={trickSoundRef} src={`${baseUrl}/sounds/vine-boom.mp3`} preload="auto" />
      <div className="play-stage">
        <ScoreBoard
          combo={combo}
          gameOver={gameOver}
          onReset={startGame}
          remaining={remainingCards}
          score={score}
          stats={stats}
        />

        <GameBoard cards={cards} onCardClick={handleCardClick} />

        {activeCard ? (
          <Modal
            card={activeCard}
            onClose={handleCloseModal}
            onResolve={applyResult}
          />
        ) : null}
      </div>
    </div>
  );
}

export default App;
