import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { ChessGame } from '../types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Play, Pause, ExternalLink, Info, Volume2, VolumeX } from 'lucide-react';

interface GameViewerProps {
  game: ChessGame | null;
  username: string;
}

export const GameViewer: React.FC<GameViewerProps> = ({ game, username }) => {
  const chess = useMemo(() => new Chess(), []);
  const [fen, setFen] = useState('start');
  const [moveIndex, setMoveIndex] = useState(-1); // -1 is start position
  const [history, setHistory] = useState<{ from: string; to: string; san: string; fen: string }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const prevMoveIndex = useRef<number>(-1);

  // Initialize Audio with JSDelivr CDN links
  useEffect(() => {
    const createAudio = (url: string) => {
        const audio = new Audio(url);
        audio.crossOrigin = 'anonymous';
        audio.load(); 
        return audio;
    };

    audioRefs.current = {
      move: createAudio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/Move.ogg'),
      capture: createAudio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/Capture.ogg'),
      // Use Capture sound for Check to make it distinct/impactful
      check: createAudio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/Capture.ogg'),
      castle: createAudio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/Move.ogg'), 
      // User requested previous "Check" sound (GenericNotify) be used for Checkmate/End
      end: createAudio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/GenericNotify.ogg'),
    };
  }, []);

  // Handle Sound Playback
  useEffect(() => {
    // Play sound if moving by exactly one step (forward or backward) and not muted
    const delta = moveIndex - prevMoveIndex.current;
    
    if (!isMuted && Math.abs(delta) === 1) {
        let soundKey = 'move';

        // If returning to start, just play move sound
        if (moveIndex === -1) {
             soundKey = 'move';
        } 
        // If landing on a move, play that move's sound
        else if (moveIndex >= 0 && moveIndex < history.length) {
            const move = history[moveIndex];
            
            if (move.san.includes('#')) {
                soundKey = 'end';
            } else if (move.san.includes('+')) {
                soundKey = 'check';
            } else if (move.san.includes('x')) {
                soundKey = 'capture';
            } else if (move.san.includes('O-O')) {
                soundKey = 'castle';
            }
        }

        const audio = audioRefs.current[soundKey];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => {
                console.warn("Audio play failed:", e);
            });
        }
    }
    prevMoveIndex.current = moveIndex;
  }, [moveIndex, history, isMuted]);

  // Determine custom square styles for Check
  const customSquareStyles = useMemo(() => {
    try {
        const tempChess = new Chess(fen);
        if (tempChess.inCheck()) {
           const turn = tempChess.turn();
           const board = tempChess.board();
           for(let r=0; r<8; r++) {
               for(let c=0; c<8; c++) {
                   const piece = board[r][c];
                   if(piece && piece.type === 'k' && piece.color === turn) {
                       const file = String.fromCharCode(97 + c);
                       const rank = 8 - r;
                       const square = `${file}${rank}`;
                       return {
                           [square]: {
                               background: 'radial-gradient(circle, rgba(255, 0, 0, 0.8) 0%, rgba(255, 0, 0, 0) 70%)',
                               borderRadius: '50%'
                           }
                       };
                   }
               }
           }
        }
    } catch (e) {
        console.error("Check highlight error", e);
    }
    return {};
  }, [fen]);

  // Initialize game when selected
  useEffect(() => {
    if (game) {
      try {
        chess.loadPgn(game.pgn);
        const historyMoves = chess.history({ verbose: true });
        
        const verboseHistory = historyMoves.map((m: any) => ({
          from: m.from,
          to: m.to,
          san: m.san,
          fen: m.after || m.fen || '' 
        }));

        setHistory(verboseHistory);
        setFen('start');
        setMoveIndex(-1);
        prevMoveIndex.current = -1;
        setIsPlaying(false);
      } catch (e) {
        console.error("Error loading PGN:", e);
      }
    }
  }, [game, chess]);

  // Handle auto-play
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        handleNext();
      }, 800); 
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, moveIndex, history.length]); 

  useEffect(() => {
    if (moveIndex >= history.length - 1 && isPlaying) {
        setIsPlaying(false);
    }
  }, [moveIndex, history, isPlaying]);


  const updateBoard = useCallback((targetIndex: number) => {
    if (targetIndex < -1 || targetIndex >= history.length) return;
    
    if (targetIndex === -1) {
        setFen('start');
    } else {
        const move = history[targetIndex];
        if (move && move.fen) {
            setFen(move.fen);
        }
    }
    setMoveIndex(targetIndex);
  }, [history]);

  const handleStart = useCallback(() => {
    setIsPlaying(false);
    updateBoard(-1);
  }, [updateBoard]);

  const handlePrev = useCallback(() => {
    setIsPlaying(false);
    updateBoard(moveIndex - 1);
  }, [moveIndex, updateBoard]);

  const handleNext = useCallback(() => {
    updateBoard(moveIndex + 1);
  }, [moveIndex, updateBoard]);

  const handleEnd = useCallback(() => {
    setIsPlaying(false);
    updateBoard(history.length - 1);
  }, [history, updateBoard]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleStart();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleEnd();
          break;
        case ' ': 
          e.preventDefault();
          togglePlay();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, handleStart, handleEnd]);

  // Scroll Navigation Handler
  const handleBoardScroll = (e: React.WheelEvent) => {
    if (scrollTimeoutRef.current) return;
    
    if (e.deltaY < 0) {
        handlePrev();
    } else if (e.deltaY > 0) {
        handleNext();
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
        scrollTimeoutRef.current = null;
    }, 30);
  };

  const togglePlay = () => {
    if (moveIndex >= history.length - 1) {
        handleStart();
        setIsPlaying(true);
    } else {
        setIsPlaying((prev) => !prev);
    }
  };

  if (!game) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-8 text-center h-full">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
            <Info className="w-8 h-8 opacity-30" />
        </div>
        <h3 className="text-xl font-light text-gray-900 mb-2">Select a Game</h3>
        <p className="font-light">Choose a match from the sidebar to review the board.</p>
      </div>
    );
  }

  const isWhite = game.white.username.toLowerCase() === username.toLowerCase();

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-white border-b border-gray-200 flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] z-10 flex-shrink-0">
        <div className="flex items-center gap-5">
            <div className={`w-3 h-3 rounded-full shadow-sm ring-1 ring-gray-200 ${isWhite ? 'bg-gray-100' : 'bg-gray-800'}`}></div>
            <h2 className="text-xl font-medium text-gray-900 tracking-tight">
                {game.white.username} <span className="text-gray-400 font-light text-sm mx-1">{game.white.rating}</span> 
                <span className="mx-3 text-gray-300 font-light">vs</span> 
                {game.black.username} <span className="text-gray-400 font-light text-sm mx-1">{game.black.rating}</span>
            </h2>
        </div>
        <div className="flex gap-3">
            <a 
                href={game.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-2"
            >
                Chess.com <ExternalLink className="w-3 h-3" />
            </a>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-gray-50">
        {/* Board Area */}
        <div 
            className="flex-1 p-6 lg:p-10 flex flex-col items-center justify-center min-h-[400px] outline-none"
            onWheel={handleBoardScroll}
        >
            <div className="w-full max-w-[65vh] aspect-square shadow-2xl shadow-gray-300/50 rounded-sm border-[12px] border-white bg-white">
                <Chessboard 
                    {...{
                        position: fen, 
                        boardOrientation: isWhite ? 'white' : 'black',
                        customDarkSquareStyle: { backgroundColor: '#b5c0d0' },
                        customLightSquareStyle: { backgroundColor: '#f1f5f9' },
                        arePiecesDraggable: false,
                        animationDuration: 0,
                        customSquareStyles: customSquareStyles
                    } as any}
                />
            </div>
        </div>

        {/* Controls & Move List */}
        <div className="w-full lg:w-[400px] bg-white border-l border-gray-200 flex flex-col shadow-xl shadow-gray-200/50 z-10">
            {/* Control Bar */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
                <div className="flex justify-center gap-1 flex-1">
                    <button onClick={handleStart} className="p-3 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors" title="Start (ArrowUp)">
                        <ChevronsLeft className="w-5 h-5" />
                    </button>
                    <button onClick={handlePrev} className="p-3 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors" title="Previous (ArrowLeft / Scroll Up)">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={togglePlay} className="p-3 mx-2 rounded-xl bg-gray-900 hover:bg-black text-white transition-colors w-14 flex items-center justify-center shadow-md shadow-gray-200" title={isPlaying ? "Pause (Space)" : "Play (Space)"}>
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button onClick={handleNext} className="p-3 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors" title="Next (ArrowRight / Scroll Down)">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button onClick={handleEnd} className="p-3 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors" title="End (ArrowDown)">
                        <ChevronsRight className="w-5 h-5" />
                    </button>
                </div>
                <button 
                    onClick={() => setIsMuted(!isMuted)} 
                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors ml-2"
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
            </div>

            {/* Move List */}
            <div className="flex-1 overflow-y-auto p-2 font-mono text-sm scroll-smooth">
                <table className="w-full border-collapse">
                    <tbody>
                    {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => {
                        const moveNum = i + 1;
                        const whiteMoveIndex = i * 2;
                        const blackMoveIndex = i * 2 + 1;
                        
                        return (
                            <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                <td className="py-2 pl-4 w-12 text-gray-400 text-xs">{moveNum}.</td>
                                <td className="py-1">
                                    <button 
                                        onClick={() => updateBoard(whiteMoveIndex)}
                                        className={`w-full text-left px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${moveIndex === whiteMoveIndex ? 'bg-gray-200 text-gray-900 font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        {history[whiteMoveIndex]?.san}
                                    </button>
                                </td>
                                <td className="py-1 pr-2">
                                    {blackMoveIndex < history.length && (
                                        <button 
                                            onClick={() => updateBoard(blackMoveIndex)}
                                            className={`w-full text-left px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${moveIndex === blackMoveIndex ? 'bg-gray-800 text-white font-bold shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            {history[blackMoveIndex]?.san}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};