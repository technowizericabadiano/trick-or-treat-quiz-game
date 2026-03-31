import playerDatabase from "./data/playerDatabase.json";
import quizSets from "./questions/quizSets";

const playersById = Object.fromEntries(
  playerDatabase.map((player) => [player.id, player])
);

const quizzesById = Object.fromEntries(quizSets.map((quiz) => [quiz.id, quiz]));

export { playerDatabase, playersById, quizzesById, quizSets };
