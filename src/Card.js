import React from "react";

function getCardStatusLabel(card) {
  if (card.status === "correct") return "Correct";
  if (card.status === "wrong") return "Wrong";
  if (card.status === "reward") return "Treat";
  if (card.status === "penalty") return "Trick";
  return "";
}

function Card({ card, onClick }) {
  const isLocked = card.status !== "closed";
  const statusLabel = getCardStatusLabel(card);
  const pumpkinSrc = `${process.env.PUBLIC_URL}/theme/pumpkin.png`;

  return (
    <button
      type="button"
      className={`pumpkin-card status-${card.status} ${isLocked ? "is-locked" : ""}`}
      onClick={onClick}
      disabled={isLocked}
      aria-label={`Pumpkin ${card.id}${statusLabel ? `, ${statusLabel}` : ""}`}
    >
      <span className="pumpkin-number">{card.id}</span>
      <img className="pumpkin-image" src={pumpkinSrc} alt="" />
      {statusLabel ? <span className="pumpkin-status">{statusLabel}</span> : null}
    </button>
  );
}

export default Card;
