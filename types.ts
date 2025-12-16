export interface ChessPlayer {
  rating: number;
  result: string;
  username: string;
  uuid?: string;
}

export interface ChessGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  tcn: string;
  uuid: string;
  initial_setup: string;
  fen: string;
  time_class: string;
  rules: string;
  white: ChessPlayer;
  black: ChessPlayer;
}

export interface ArchiveResponse {
  archives: string[];
}

export interface GamesResponse {
  games: ChessGame[];
}

export interface DateRange {
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

export interface SearchFilters {
  opening: string;
  result: string;
}

export interface GameAnalysis {
  summary: string;
  move_assessments: {
    move_number: number;
    color: 'white' | 'black';
    assessment: 'brilliant' | 'blunder' | 'mistake' | 'best';
    explanation: string;
  }[];
}