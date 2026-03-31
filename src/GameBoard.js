import React, { memo } from "react";
import { useLocalization } from "./LocalizationContext";
import Card from "./Card";
import { ghostArt, treatArt, trickClusterArt } from "./pptThemeAssets";

const GameBoard = memo(function GameBoard({ cards, onCardClick }) {
  const { copy } = useLocalization();

  return (
    <section className="board-stage" aria-label={copy.boardAriaLabel}>
      <img className="board-stage-ghost board-stage-ghost-left" src={ghostArt} alt="" />
      <img className="board-stage-ghost board-stage-ghost-right" src={ghostArt} alt="" />
      <img className="board-stage-badge board-stage-badge-left" src={treatArt} alt="" />
      <img className="board-stage-badge board-stage-badge-right" src={trickClusterArt} alt="" />

      <div className="game-board">
        {cards.map((card) => (
          <Card key={card.id} card={card} onClick={() => onCardClick(card.id)} />
        ))}
      </div>
    </section>
  );
});

export default GameBoard;
