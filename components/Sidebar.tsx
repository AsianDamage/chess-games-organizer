import React from 'react';
import { ChessGame } from '../types';
import { Trophy, Target, Minus, Ban, Clock, Flag } from 'lucide-react';

interface SidebarProps {
  games: ChessGame[];
  selectedGame: ChessGame | null;
  username: string;
  onSelectGame: (game: ChessGame) => void;
  onReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ games, selectedGame, username, onSelectGame, onReset }) => {
  const getResultIcon = (game: ChessGame) => {
    const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
    const result = isWhite ? game.white.result : game.black.result;
    
    if (result === 'win') return <Trophy className="w-3 h-3" />;
    if (result === 'checkmated') return <Target className="w-3 h-3" />;
    if (result === 'timeout') return <Clock className="w-3 h-3" />;
    if (result === 'resigned') return <Flag className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getGameStyle = (game: ChessGame, isSelected: boolean) => {
    const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
    const result = isWhite ? game.white.result : game.black.result;
    
    const base = "w-full text-left p-4 rounded-xl border transition-all duration-200 group";
    
    // Result-based tinting
    if (result === 'win') {
        return `${base} ${isSelected 
            ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200 shadow-sm' 
            : 'bg-emerald-50/40 border-emerald-100/50 hover:bg-emerald-50 hover:border-emerald-200'}`;
    }
    
    if (['checkmated', 'resigned', 'timeout', 'abandoned', 'lose'].includes(result)) {
        return `${base} ${isSelected 
            ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200 shadow-sm' 
            : 'bg-rose-50/40 border-rose-100/50 hover:bg-rose-50 hover:border-rose-200'}`;
    }
    
    // Default/Draw
    return `${base} ${isSelected 
        ? 'bg-gray-50 border-gray-300 ring-1 ring-gray-200 shadow-sm' 
        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`;
  };

  const getBadgeClass = (game: ChessGame) => {
    const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
    const result = isWhite ? game.white.result : game.black.result;
    
    if (result === 'win') {
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    }
    if (['checkmated', 'resigned', 'timeout', 'abandoned', 'lose'].includes(result)) {
        return 'bg-rose-100 text-rose-800 border border-rose-200';
    }
    return 'bg-gray-100 text-gray-600 border border-gray-200';
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full md:w-80 lg:w-96 flex-shrink-0">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
            <h3 className="font-semibold text-gray-900 truncate max-w-[150px] text-lg">{username}</h3>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{games.length} games found</span>
        </div>
        <button 
            onClick={onReset}
            className="text-xs px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors font-medium"
        >
            New Search
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {games.length === 0 ? (
            <div className="text-center p-8 text-gray-400 text-sm">No games match filters</div>
        ) : (
            games.map((game) => {
            const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
            const opponent = isWhite ? game.black : game.white;
            const userPlayer = isWhite ? game.white : game.black;
            const date = new Date(game.end_time * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            const isSelected = selectedGame?.url === game.url;

            return (
                <button
                key={game.url}
                onClick={() => onSelectGame(game)}
                className={getGameStyle(game, isSelected)}
                >
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-900 truncate pr-2">
                    vs. {opponent.username}
                    </span>
                    <span className={`text-[10px] px-2 py-1 rounded-md flex items-center gap-1.5 uppercase tracking-wide font-bold ${getBadgeClass(game)}`}>
                    {getResultIcon(game)}
                    {userPlayer.result}
                    </span>
                </div>
                
                <div className="flex justify-between items-end text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-3">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            {game.time_class}
                        </span>
                        <span className="font-mono text-gray-400">{opponent.rating}</span>
                    </div>
                    <span className="text-gray-400">{date}</span>
                </div>
                </button>
            );
            })
        )}
      </div>
    </div>
  );
};