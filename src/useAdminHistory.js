import { useCallback, useMemo, useState } from "react";
import { ADMIN_ACCESS_CODE } from "./adminSettings";
import {
  clearPlayerHistory,
  createPlayerHistoryCsv,
  loadPlayerHistory,
  recordPlayerGame,
  savePlayerHistory,
} from "./playerHistory";
import { buildActivityRows, getTotalGamesPlayed } from "./gameUtils";

function useAdminHistory(players) {
  const [adminCodeInput, setAdminCodeInput] = useState("");
  const [adminAccessError, setAdminAccessError] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [playerHistory, setPlayerHistory] = useState(loadPlayerHistory);

  const activityRows = useMemo(
    () => buildActivityRows(players, playerHistory),
    [players, playerHistory]
  );
  const playedPlayerCount = activityRows.length;
  const totalGamesPlayed = useMemo(
    () => getTotalGamesPlayed(activityRows),
    [activityRows]
  );

  const markPlayerPlayed = useCallback((playerId, score = 0, isNewGame = false) => {
    setPlayerHistory((previousHistory) => {
      const nextHistory = recordPlayerGame(previousHistory, playerId, score, isNewGame);

      savePlayerHistory(nextHistory);
      return nextHistory;
    });
  }, []);

  const handleAdminCodeChange = useCallback((nextValue) => {
    setAdminCodeInput(nextValue);
    setAdminAccessError(false);
  }, []);

  const handleUnlockAdminTools = useCallback(() => {
    if (adminCodeInput === ADMIN_ACCESS_CODE) {
      setIsAdminUnlocked(true);
      setAdminAccessError(false);
      setAdminCodeInput("");
      return;
    }

    setAdminAccessError(true);
  }, [adminCodeInput]);

  const handleLockAdminTools = useCallback(() => {
    setIsAdminUnlocked(false);
    setAdminCodeInput("");
    setAdminAccessError(false);
  }, []);

  const handleClearPlayerHistory = useCallback(() => {
    if (!isAdminUnlocked) {
      return;
    }

    clearPlayerHistory();
    setPlayerHistory({});
  }, [isAdminUnlocked]);

  const handleExportPlayerHistory = useCallback(() => {
    if (!isAdminUnlocked) {
      return;
    }

    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const csvContent = createPlayerHistoryCsv(players, playerHistory);
    const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const downloadUrl = window.URL.createObjectURL(csvBlob);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = "player-history.csv";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);
  }, [isAdminUnlocked, playerHistory, players]);

  return {
    activityRows,
    adminAccessError,
    adminCodeInput,
    handleAdminCodeChange,
    handleClearPlayerHistory,
    handleExportPlayerHistory,
    handleLockAdminTools,
    handleUnlockAdminTools,
    isAdminUnlocked,
    markPlayerPlayed,
    playedPlayerCount,
    playerHistory,
    totalGamesPlayed,
  };
}

export { useAdminHistory };
