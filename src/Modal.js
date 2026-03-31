import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocalization } from "./LocalizationContext";
import {
  backButtonArt,
  pumpkinArt,
  treatArt,
  trickClusterArt,
  trickGhostArt,
} from "./pptThemeAssets";

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

function getCardHeading(card, copy, selectedIndex) {
  if (card.type !== "question") {
    return copy.headingByType[card.type];
  }

  if (selectedIndex === null) {
    return copy.headingByType.question;
  }

  return selectedIndex === card.answerIndex
    ? copy.resultLabels.correct
    : copy.resultLabels.wrong;
}

function getModalArt(card, selectedIndex) {
  if (card.type === "treat") {
    return treatArt;
  }

  if (card.type === "trick") {
    return trickClusterArt;
  }

  if (selectedIndex === null) {
    return pumpkinArt;
  }

  return selectedIndex === card.answerIndex ? treatArt : trickGhostArt;
}

function getModalTitle(card, copy, selectedIndex) {
  if (card.type === "question") {
    if (selectedIndex === null) {
      return copy.questionTitle;
    }

    return selectedIndex === card.answerIndex
      ? copy.resultLabels.correct
      : copy.resultLabels.wrong;
  }

  return copy.headingByType[card.type];
}

function Modal({ card, onAnswer, onClaim, onClose }) {
  const { copy } = useLocalization();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const timersRef = useRef([]);
  const isQuestionCard = card.type === "question";
  const modalArt = useMemo(() => getModalArt(card, selectedIndex), [card, selectedIndex]);
  const modalHeading = getCardHeading(card, copy, selectedIndex);
  const modalTitle = getModalTitle(card, copy, selectedIndex);

  useEffect(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
    setSelectedIndex(null);
    setIsResolving(false);

    return () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current = [];
    };
  }, [card.id]);

  const queueCallback = (callback, delay) => {
    const timerId = window.setTimeout(callback, delay);
    timersRef.current.push(timerId);
  };

  const handleAnswerClick = (index) => {
    if (isResolving) {
      return;
    }

    setSelectedIndex(index);
    setIsResolving(true);
    queueCallback(() => {
      onAnswer(card, index);
    }, 900);
  };

  const handleClaimClick = () => {
    if (isResolving) {
      return;
    }

    setIsResolving(true);
    queueCallback(() => {
      onClaim(card);
    }, 550);
  };

  return (
    <aside className={`modal-backdrop type-${card.type}`} role="dialog" aria-modal="true">
      <div className={`modal-panel type-${card.type} ${isResolving ? "is-resolving" : ""}`}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          disabled={isResolving}
          aria-label={copy.close}
        >
          <img src={backButtonArt} alt="" aria-hidden="true" />
        </button>

        <div className="modal-art-stage">
          <div className="modal-art-glow" aria-hidden="true" />
          <img className={`modal-art type-${card.type}`} src={modalArt} alt="" aria-hidden="true" />
        </div>

        <div className="modal-copy">
          <p className={`modal-tag type-${card.type}`}>{modalHeading}</p>
          <h2 className="modal-title">{modalTitle}</h2>
          <p className="modal-text">{card.text}</p>

          {isQuestionCard && selectedIndex !== null ? (
            <p className={`modal-feedback ${selectedIndex === card.answerIndex ? "is-good" : "is-bad"}`}>
              {selectedIndex === card.answerIndex
                ? copy.resultLabels.correct
                : copy.resultLabels.wrong}
            </p>
          ) : null}

          {isQuestionCard ? (
            <div className="modal-options">
              {card.options.map((option, index) => {
                const isCorrectAnswer = index === card.answerIndex;
                const isChosenAnswer = index === selectedIndex;
                const showResolvedState = selectedIndex !== null;
                const optionClassName = [
                  "option-button",
                  showResolvedState && isCorrectAnswer ? "is-correct" : "",
                  showResolvedState && isChosenAnswer && !isCorrectAnswer ? "is-wrong" : "",
                  showResolvedState &&
                  !isChosenAnswer &&
                  !isCorrectAnswer
                    ? "is-muted"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={option}
                    type="button"
                    className={optionClassName}
                    disabled={isResolving}
                    onClick={() => handleAnswerClick(index)}
                    style={{ touchAction: "manipulation" }}
                  >
                    <span className="option-key">{OPTION_LABELS[index] || index + 1}</span>
                    <span className="option-copy">{option}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <button
              type="button"
              className={`action-button type-${card.type}`}
              onClick={handleClaimClick}
              style={{ touchAction: "manipulation" }}
              disabled={isResolving}
            >
              {copy.continue}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Modal;
