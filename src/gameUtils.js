import { actionCardsByLanguage } from "./content/localization";

let sharedAudioContext = null;

const SOUND_PATTERNS = {
  flip: [
    { duration: 0.04, frequency: 520, type: "triangle", volume: 0.03 },
    { duration: 0.06, frequency: 380, type: "triangle", volume: 0.025 },
  ],
  treat: [
    { duration: 0.08, frequency: 660, type: "sine", volume: 0.04 },
    { duration: 0.08, frequency: 880, type: "sine", volume: 0.04 },
    { duration: 0.1, frequency: 1040, type: "sine", volume: 0.045 },
  ],
  trick: [
    { duration: 0.09, frequency: 240, type: "sawtooth", volume: 0.035 },
    { duration: 0.12, frequency: 180, type: "sawtooth", volume: 0.03 },
  ],
  correct: [
    { duration: 0.07, frequency: 740, type: "sine", volume: 0.04 },
    { duration: 0.09, frequency: 988, type: "sine", volume: 0.045 },
  ],
  wrong: [
    { duration: 0.09, frequency: 320, type: "square", volume: 0.03 },
    { duration: 0.12, frequency: 220, type: "square", volume: 0.028 },
  ],
};

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass();
  }

  return sharedAudioContext;
}

function scheduleTone(context, startTime, step) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const attackTime = Math.min(0.02, step.duration / 3);
  const stopTime = startTime + step.duration;

  oscillator.type = step.type;
  oscillator.frequency.setValueAtTime(step.frequency, startTime);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(step.volume, startTime + attackTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(stopTime);
}

function playSound(effect) {
  const context = getAudioContext();
  const pattern = SOUND_PATTERNS[effect];

  if (!context || !pattern) {
    return;
  }

  // Mobile browsers often require a direct resume call 
  // within the user gesture execution stack.
  if (context.state === "suspended") {
    context.resume();
  }

  const playPattern = () => {
    let cursor = context.currentTime + 0.01;

    pattern.forEach((step) => {
      scheduleTone(context, cursor, step);
      cursor += step.duration;
    });
  };

  playPattern();
}

function shuffleArray(array) {
  const copy = [...array];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  }

  return copy;
}

function createDeck(language, questionCards) {
  const actionCards = actionCardsByLanguage[language] || [];

  return shuffleArray([...actionCards, ...questionCards]).map((card, index) => ({
    ...card,
    id: index + 1,
    status: "closed",
    resultKey: "",
  }));
}

function toSafeNumber(value) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function buildActivityRows(players, playerHistory) {
  return players
    .map((player) => {
      const historyEntry = playerHistory[player.id];

      return historyEntry
        ? {
            group: player.group,
            highScore: historyEntry.highScore || 0,
            id: player.id,
            lastPlayedAt: historyEntry.lastPlayedAt,
            name: player.name,
            playCount: historyEntry.playCount,
          }
        : null;
    })
    .filter(Boolean)
    .sort((left, right) => right.lastPlayedAt.localeCompare(left.lastPlayedAt));
}

function getTotalGamesPlayed(activityRows) {
  return activityRows.reduce((total, row) => total + row.playCount, 0);
}

export {
  buildActivityRows,
  createDeck,
  getTotalGamesPlayed,
  playSound,
  toSafeNumber,
};
