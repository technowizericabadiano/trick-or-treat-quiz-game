import React, { memo } from "react";
import { useLocalization } from "./LocalizationContext";
import { toSafeNumber } from "./gameUtils";
import { pumpkinArt } from "./pptThemeAssets";

function getResolvedTone(card) {
  if (card.resultKey === "bonus" || card.resultKey === "correct") {
    return "good";
  }

  if (card.resultKey === "trick" || card.resultKey === "wrong") {
    return "bad";
  }

  return "neutral";
}

function getResolvedDelta(card) {
  if (card.resultKey === "bonus" || card.resultKey === "correct") {
    return `+${toSafeNumber(card.points)}`;
  }

  if (card.resultKey === "trick") {
    return `-${toSafeNumber(card.points)}`;
  }

  if (card.resultKey === "wrong") {
    return `-${toSafeNumber(card.penalty)}`;
  }

  return "";
}

const Card = memo(function Card({ card, onClick }) {
  const { copy } = useLocalization();
  const isClosed = card.status === "closed";
  const resultLabel = copy.resultLabels[card.resultKey] || "";
  const resultDelta = getResolvedDelta(card);
  const resolvedTone = getResolvedTone(card);

  return (
    <button
      type="button"
      className={`game-card ${isClosed ? "is-closed" : "is-resolved"} result-${
        card.resultKey || "none"
      }`}
      disabled={!isClosed}
      onClick={onClick}
      style={{ "--card-delay": card.id - 1, touchAction: "manipulation" }}
      aria-label={
        isClosed ? copy.openCardAria(card.id) : copy.usedCardAria(card.id, resultLabel)
      }
    >
      <span className="game-card-shell">
        <span className="game-card-glow" aria-hidden="true" />
        <span className="game-card-number">{card.id}</span>
        <img className="game-card-pumpkin" src={pumpkinArt} alt="" aria-hidden="true" />
        <span className="game-card-shadow" aria-hidden="true" />

        {isClosed ? (
          <span className="game-card-prompt">{copy.open}</span>
        ) : (
          <span className={`game-card-result game-card-result-${resolvedTone}`}>
            {resultDelta ? (
              <strong className="game-card-result-delta">{resultDelta}</strong>
            ) : null}
            <span className="game-card-result-label">{resultLabel}</span>
          </span>
        )}
      </span>
    </button>
  );
});

export default Card;
