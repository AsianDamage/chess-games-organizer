import { ChessGame, GamesResponse, DateRange } from '../types';

const BASE_URL = 'https://api.chess.com/pub';

export const fetchPlayerGames = async (
  username: string,
  range: DateRange
): Promise<ChessGame[]> => {
  const games: ChessGame[] = [];
  const { startYear, startMonth, endYear, endMonth } = range;

  // Generate list of YYYY/MM to fetch
  const targets: { year: number; month: number }[] = [];

  let currentYear = startYear;
  let currentMonth = startMonth;

  // Normalize inputs to ensure loop termination
  const endDateVal = endYear * 12 + endMonth;

  while (currentYear * 12 + currentMonth <= endDateVal) {
    targets.push({ year: currentYear, month: currentMonth });

    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  // Fetch concurrently (limit concurrency if needed, but for typical ranges Promise.all is fine)
  const promises = targets.map(async ({ year, month }) => {
    // Chess.com expects MM to be 2 digits
    const mm = month.toString().padStart(2, '0');
    const url = `${BASE_URL}/player/${username}/games/${year}/${mm}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return []; // No games that month or user not found yet
        throw new Error(`Failed to fetch ${year}/${mm}`);
      }
      const data: GamesResponse = await res.json();
      return data.games || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  const results = await Promise.all(promises);
  results.forEach(monthlyGames => games.push(...monthlyGames));

  // Sort games by end_time descending (newest first)
  return games.sort((a, b) => b.end_time - a.end_time);
};

export const validateUsername = async (username: string): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/player/${username}`);
    return res.ok;
  } catch {
    return false;
  }
};
