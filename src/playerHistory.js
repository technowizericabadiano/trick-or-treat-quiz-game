const PLAYER_HISTORY_STORAGE_KEY = "trick-or-treat-player-history";

function loadPlayerHistory() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const storedValue = window.localStorage.getItem(PLAYER_HISTORY_STORAGE_KEY);

    if (!storedValue) {
      return {};
    }

    const parsedValue = JSON.parse(storedValue);

    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
}

function savePlayerHistory(history) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PLAYER_HISTORY_STORAGE_KEY,
    JSON.stringify(history)
  );
}

function recordPlayerGame(history, playerId, score = 0, isNewGame = false) {
  const currentEntry = history[playerId] || {
    lastPlayedAt: "",
    playCount: 0,
    highScore: 0,
  };

  return {
    ...history,
    [playerId]: {
      lastPlayedAt: new Date().toISOString(),
      playCount: isNewGame ? currentEntry.playCount + 1 : currentEntry.playCount,
      highScore: Math.max(currentEntry.highScore || 0, score),
    },
  };
}

function clearPlayerHistory() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PLAYER_HISTORY_STORAGE_KEY);
}

function createPlayerHistoryCsv(players, history) {
  const rows = [
    ["playerId", "name", "group", "canPlay", "playCount", "highScore", "lastPlayedAt"],
  ];

  players.forEach((player) => {
    const historyEntry = history[player.id] || {
      playCount: 0,
      highScore: 0,
      lastPlayedAt: "",
    };

    rows.push([
      player.id,
      player.name,
      player.group,
      player.canPlay ? "true" : "false",
      String(historyEntry.playCount),
      String(historyEntry.highScore),
      historyEntry.lastPlayedAt,
    ]);
  });

  return rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
}

export {
  clearPlayerHistory,
  createPlayerHistoryCsv,
  loadPlayerHistory,
  recordPlayerGame,
  savePlayerHistory,
};
