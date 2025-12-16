import React, { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { Sidebar } from './components/Sidebar';
import { GameViewer } from './components/GameViewer';
import { LoadingScreen } from './components/LoadingScreen';
import { fetchPlayerGames } from './services/chessService';
import { ChessGame, DateRange, SearchFilters } from './types';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [games, setGames] = useState<ChessGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<ChessGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchedUser, setSearchedUser] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = async (username: string, range: DateRange, filters: SearchFilters) => {
    setLoading(true);
    setSearchedUser(username);
    // Don't clear immediately to avoid flash if possible, but logic dictates new search
    setGames([]);
    setSelectedGame(null);
    setHasSearched(true);
    setIsMobileMenuOpen(false);
    
    try {
      const allGames = await fetchPlayerGames(username, range);
      
      // Filter games locally
      const filteredGames = allGames.filter(game => {
        // Opening filter
        if (filters.opening) {
            const hasOpening = game.pgn.toLowerCase().includes(filters.opening.toLowerCase());
            if (!hasOpening) return false;
        }

        // Result filter
        if (filters.result !== 'all') {
            const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
            const myResult = isWhite ? game.white.result : game.black.result;

            if (filters.result === 'win') {
                if (myResult !== 'win') return false;
            } else if (filters.result === 'loss') {
                // Any loss
                if (!['checkmated', 'resigned', 'timeout', 'abandoned', 'lose'].includes(myResult)) return false;
            } else if (filters.result === 'draw') {
                if (!['agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timevsinsufficient'].includes(myResult)) return false;
            } else {
                // Specific loss type like 'checkmated', 'resigned', etc.
                if (myResult !== filters.result) return false;
            }
        }
        
        return true;
      });

      setGames(filteredGames);
    } catch (error) {
      console.error("Error fetching games", error);
      // In a real app, you might want to show an error state here
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGames([]);
    setHasSearched(false);
    setSelectedGame(null);
    setSearchedUser('');
  };

  // If loading, show the full screen loader
  if (loading) {
    return <LoadingScreen />;
  }

  // If no search executed, show landing page
  if (!hasSearched) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="z-10 w-full max-w-2xl">
            <SearchForm onSearch={handleSearch} isLoading={loading} />
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50 relative overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden p-4 bg-white border-b border-gray-200 flex justify-between items-center z-30">
        <h1 className="font-semibold text-gray-900">Chess Games Organizer</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
            {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar - Conditional on Mobile */}
      <div className={`
        absolute md:relative z-20 top-0 left-0 h-full bg-white transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0 w-3/4' : '-translate-x-full w-0'}
        md:translate-x-0 md:w-auto md:flex
      `}>
         <Sidebar 
            games={games} 
            selectedGame={selectedGame} 
            username={searchedUser}
            onSelectGame={(g) => {
                setSelectedGame(g);
                setIsMobileMenuOpen(false);
            }}
            onReset={handleReset}
         />
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
          <div 
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
      )}

      {/* Main Content */}
      <GameViewer game={selectedGame} username={searchedUser} />
    </div>
  );
};

export default App;