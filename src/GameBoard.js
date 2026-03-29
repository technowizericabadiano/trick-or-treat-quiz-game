import React from "react";
import Card from "./Card";

function GameBoard({ cards, onCardClick }) {
  return (
    <section className="board-shell" aria-label="Trick or Treat board">
      <div className="game-board">
        {cards.map((card) => (
          <Card key={card.id} card={card} onClick={() => onCardClick(card.id)} />
        ))}
      </div>
    </section>
  );
}

export default GameBoard;
