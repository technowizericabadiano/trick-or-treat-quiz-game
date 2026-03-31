import generalQuestions from "./generalQuestions";
import mathQuestions from "./mathQuestions";
import scienceQuestions from "./scienceQuestions";

const quizSets = [
  {
    id: "general",
    title: {
      en: "General Knowledge",
      tl: "General Knowledge",
    },
    description: {
      en: "Easy questions about everyday facts and common knowledge.",
      tl: "Madadaling tanong tungkol sa araw-araw na kaalaman.",
    },
    questionsByLanguage: generalQuestions,
  },
  {
    id: "math",
    title: {
      en: "Math Quiz",
      tl: "Math Quiz",
    },
    description: {
      en: "Basic math, time, fractions, and shapes.",
      tl: "Mga basic na tanong sa math, oras, fraction, at shapes.",
    },
    questionsByLanguage: mathQuestions,
  },
  {
    id: "science",
    title: {
      en: "Science Quiz",
      tl: "Science Quiz",
    },
    description: {
      en: "Simple questions about the body, plants, animals, and space.",
      tl: "Simpleng tanong tungkol sa katawan, halaman, hayop, at kalawakan.",
    },
    questionsByLanguage: scienceQuestions,
  },
];

export default quizSets;
