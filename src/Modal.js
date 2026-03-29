import React, { useEffect, useState } from "react";

const TIME_LIMIT = 15;

function BackButton({ disabled = false, onClick }) {
  const backButtonSrc = `${process.env.PUBLIC_URL}/theme/back-button.png`;

  return (
    <button
      type="button"
      className="back-button"
      disabled={disabled}
      onClick={onClick}
      aria-label="Back"
    >
      <img src={backButtonSrc} alt="" />
    </button>
  );
}

function ResultScreen({ card, onResolve }) {
  const isPenalty = card.type === "penalty";
  const baseUrl = process.env.PUBLIC_URL;
  const artSource = isPenalty
    ? card.penaltyType === "loseAll"
      ? `${baseUrl}/theme/trick-ghosts.png`
      : `${baseUrl}/theme/trick-ghost.png`
    : `${baseUrl}/theme/treat-candy.png`;
  const smokeBackground = `linear-gradient(rgba(70, 65, 65, 0.78), rgba(70, 65, 65, 0.88)), url(${baseUrl}/theme/smoke-texture.png) center / cover no-repeat, linear-gradient(180deg, #514b4b 0%, #3f3a3a 100%)`;

  return (
    <div className="modal-surface result-screen" style={{ background: smokeBackground }}>
      <div className="result-art-wrap">
        <img className="result-art" src={artSource} alt="" />
      </div>
      <p className="result-message">{card.text}</p>
      <BackButton onClick={() => onResolve({ card })} />
    </div>
  );
}

function QuestionScreen({
  card,
  feedback,
  locked,
  onClose,
  onSelectOption,
  timeLeft,
}) {
  return (
    <div className="modal-surface question-screen">
      <div className="screen-topline">
        <span className="screen-chip">Question {card.id}</span>
        <span className={`screen-chip timer-chip ${timeLeft <= 5 ? "is-warning" : ""}`}>
          {timeLeft}s
        </span>
      </div>

      <div className="question-box">{card.text}</div>

      <div className="answers-grid">
        {card.options.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index);

          return (
            <button
              key={option}
              type="button"
              className="answer-option"
              disabled={locked}
              onClick={() => onSelectOption(index)}
            >
              <span className="answer-option-key">{optionLabel}</span>
              <span className="answer-option-copy">{option}</span>
            </button>
          );
        })}
      </div>

      <div className="screen-footer">
        {feedback ? <p className="feedback-banner">{feedback}</p> : <span className="screen-spacer" />}
        <BackButton disabled={locked} onClick={onClose} />
      </div>
    </div>
  );
}

function ChallengeGrid({ card, input, locked, onChange, onSubmit }) {
  return (
    <form className={`challenge-grid layout-${card.layout}`} onSubmit={onSubmit}>
      {card.clues?.top ? <div className="word-card pos-top">{card.clues.top}</div> : null}
      {card.clues?.left ? <div className="word-card pos-left">{card.clues.left}</div> : null}

      <div className="word-card center-card pos-center">
        <label className="sr-only" htmlFor="challenge-answer">
          Type the missing word
        </label>
        <input
          id="challenge-answer"
          autoFocus
          className="challenge-input"
          disabled={locked}
          onChange={(event) => onChange(event.target.value)}
          placeholder="?"
          value={input}
        />
      </div>

      {card.clues?.right ? <div className="word-card pos-right">{card.clues.right}</div> : null}
      {card.clues?.bottom ? <div className="word-card pos-bottom">{card.clues.bottom}</div> : null}
      <button type="submit" className="sr-only">
        Submit answer
      </button>
    </form>
  );
}

function ChallengeScreen({
  card,
  feedback,
  input,
  locked,
  onChangeInput,
  onClose,
  onSubmit,
  timeLeft,
}) {
  const isPromptLayout = card.layout === "prompt";

  return (
    <div className="modal-surface challenge-screen">
      <div className="screen-topline">
        <span className="screen-chip">Challenge</span>
        <span className={`screen-chip timer-chip ${timeLeft <= 5 ? "is-warning" : ""}`}>
          {timeLeft}s
        </span>
      </div>

      {isPromptLayout ? (
        <form className="challenge-prompt-form" onSubmit={onSubmit}>
          <div className="challenge-title-box">Challenge</div>
          <div className="challenge-question-box">{card.text}</div>
          <div className="challenge-prompt-input">
            <div className="word-card center-card challenge-prompt-answer">
              <label className="sr-only" htmlFor="challenge-answer-prompt">
                Type the hidden word
              </label>
              <input
                id="challenge-answer-prompt"
                autoFocus
                className="challenge-input"
                disabled={locked}
                onChange={(event) => onChangeInput(event.target.value)}
                placeholder="?"
                value={input}
              />
            </div>
          </div>
          <button type="submit" className="sr-only">
            Submit answer
          </button>
        </form>
      ) : (
        <>
          <p className="challenge-helper">{card.prompt}</p>
          <ChallengeGrid
            card={card}
            input={input}
            locked={locked}
            onChange={onChangeInput}
            onSubmit={onSubmit}
          />
          <p className="challenge-tip">Type the missing word in the center tile and press Enter.</p>
        </>
      )}

      <div className="screen-footer">
        {feedback ? <p className="feedback-banner">{feedback}</p> : <span className="screen-spacer" />}
        <BackButton disabled={locked} onClick={onClose} />
      </div>
    </div>
  );
}

function Modal({ card, onClose, onResolve }) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  const isActionCard = card.type === "reward" || card.type === "penalty";
  const isQuestionCard = card.type === "question";
  const isChallengeCard = card.type === "challenge";

  useEffect(() => {
    setInput("");
    setFeedback("");
    setLocked(false);
    setTimeLeft(TIME_LIMIT);
  }, [card.id]);

  useEffect(() => {
    if (!isQuestionCard && !isChallengeCard) return undefined;
    if (locked) return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          window.clearInterval(timer);
          setLocked(true);
          setFeedback(`Time is up. -${Math.round(card.points / 2)} points`);
          window.setTimeout(() => onResolve({ card, success: false }), 700);
          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [card, isChallengeCard, isQuestionCard, locked, onResolve]);

  const resolveWithFeedback = (success) => {
    if (locked) return;

    const pointsText = success ? `+${card.points} points` : `-${Math.round(card.points / 2)} points`;
    setLocked(true);
    setFeedback(success ? `Correct. ${pointsText}` : `Wrong answer. ${pointsText}`);
    window.setTimeout(() => onResolve({ card, success }), success ? 650 : 800);
  };

  const handleQuestionSelect = (selectedIndex) => {
    resolveWithFeedback(selectedIndex === card.correctOptionIndex);
  };

  const handleChallengeSubmit = (event) => {
    event.preventDefault();
    const normalizedAnswer = input.trim().toLowerCase();
    const expectedAnswer = card.answer.trim().toLowerCase();
    resolveWithFeedback(normalizedAnswer === expectedAnswer);
  };

  return (
    <aside className="modal-overlay" role="dialog" aria-modal="true">
      {isActionCard ? <ResultScreen card={card} onResolve={onResolve} /> : null}
      {isQuestionCard ? (
        <QuestionScreen
          card={card}
          feedback={feedback}
          locked={locked}
          onClose={onClose}
          onSelectOption={handleQuestionSelect}
          timeLeft={timeLeft}
        />
      ) : null}
      {isChallengeCard ? (
        <ChallengeScreen
          card={card}
          feedback={feedback}
          input={input}
          locked={locked}
          onChangeInput={setInput}
          onClose={onClose}
          onSubmit={handleChallengeSubmit}
          timeLeft={timeLeft}
        />
      ) : null}
    </aside>
  );
}

export default Modal;
