import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pause, Play, RotateCcw, ArrowDown, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { useLeaderboard } from '@/contexts/LeaderboardContext';

// Tetris piece definitions
const PIECES = {
  I: [
    [[1, 1, 1, 1]]
  ],
  O: [
    [[1, 1], [1, 1]]
  ],
  T: [
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1], [1, 1], [0, 1]]
  ],
  S: [
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 1], [0, 1]]
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1], [1, 1], [1, 0]]
  ],
  J: [
    [[1, 0, 0], [1, 1, 1]],
    [[1, 1], [1, 0], [1, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[0, 1], [0, 1], [1, 1]]
  ],
  L: [
    [[0, 0, 1], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1], [0, 1], [0, 1]]
  ]
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY_BOARD = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));

interface GamePiece {
  shape: number[][];
  x: number;
  y: number;
  type: keyof typeof PIECES;
  rotation: number;
}

const TetrisGame: React.FC = () => {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [currentPiece, setCurrentPiece] = useState<GamePiece | null>(null);
  const [nextPiece, setNextPiece] = useState<keyof typeof PIECES>('I');
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameRunning, setGameRunning] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const postedRef = useRef(false);
  const { addEntry } = useLeaderboard();

  const getRandomPiece = useCallback((): keyof typeof PIECES => {
    const pieces = Object.keys(PIECES) as (keyof typeof PIECES)[];
    return pieces[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (2**32) * pieces.length)];
  }, []);

  const createPiece = useCallback((type: keyof typeof PIECES): GamePiece => {
    return {
      shape: PIECES[type][0],
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
      type,
      rotation: 0
    };
  }, []);

  const isValidPosition = useCallback((piece: GamePiece, board: number[][]): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x;
          const newY = piece.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const rotatePiece = useCallback((piece: GamePiece): GamePiece => {
    const rotations = PIECES[piece.type];
    const newRotation = (piece.rotation + 1) % rotations.length;
    return {
      ...piece,
      shape: rotations[newRotation],
      rotation: newRotation
    };
  }, []);

  const clearLines = useCallback((board: number[][]): { newBoard: number[][]; clearedLines: number } => {
    let clearedLines = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== 0)) {
        clearedLines++;
        return false;
      }
      return true;
    });

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }

    return { newBoard, clearedLines };
  }, []);

  const placePiece = useCallback((piece: GamePiece, board: number[][]): number[][] => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] && piece.y + y >= 0) {
          newBoard[piece.y + y][piece.x + x] = piece.type === 'I' ? 1 : 
                                               piece.type === 'O' ? 2 : 
                                               piece.type === 'T' ? 3 : 
                                               piece.type === 'S' ? 4 : 
                                               piece.type === 'Z' ? 5 : 
                                               piece.type === 'J' ? 6 : 7;
        }
      }
    }
    
    return newBoard;
  }, []);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gamePaused || !gameRunning) return;

    const newPiece = { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy };
    
    if (isValidPosition(newPiece, board)) {
      setCurrentPiece(newPiece);
    } else if (dy > 0) {
      // Piece hit bottom, place it
      const newBoard = placePiece(currentPiece, board);
      const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setLines(prev => prev + clearedLines);
      setScore(prev => prev + (clearedLines * 100 * level) + 10);
      
      // Create new piece
      const newPieceType = nextPiece;
      const newPieceNew = createPiece(newPieceType);
      
      if (isValidPosition(newPieceNew, clearedBoard)) {
        setCurrentPiece(newPieceNew);
        setNextPiece(getRandomPiece());
      } else {
        setGameOver(true);
        setGameRunning(false);
      }
    }
  }, [currentPiece, board, gamePaused, gameRunning, isValidPosition, placePiece, clearLines, level, nextPiece, createPiece, getRandomPiece]);

  const rotate = useCallback(() => {
    if (!currentPiece || gamePaused || !gameRunning) return;

    const rotatedPiece = rotatePiece(currentPiece);
    if (isValidPosition(rotatedPiece, board)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [currentPiece, board, gamePaused, gameRunning, rotatePiece, isValidPosition]);

  const startGame = useCallback(() => {
    setBoard(EMPTY_BOARD);
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setGameRunning(true);
    setGamePaused(false);
    postedRef.current = false;
    
    const firstPiece = getRandomPiece();
    setCurrentPiece(createPiece(firstPiece));
    setNextPiece(getRandomPiece());
  }, [getRandomPiece, createPiece]);

  const pauseGame = useCallback(() => {
    setGamePaused(!gamePaused);
  }, [gamePaused]);

  const resetGame = useCallback(() => {
    setGameRunning(false);
    setGamePaused(false);
    setGameOver(false);
    setCurrentPiece(null);
    startGame();
  }, [startGame]);

  // Post score to leaderboard once on game over
  useEffect(() => {
    if (gameOver && !postedRef.current && score > 0) {
      postedRef.current = true;
      addEntry({ game: 'Tetris', score });
    }
  }, [gameOver, score, addEntry]);

  // Game loop
  useEffect(() => {
    if (gameRunning && !gamePaused) {
      gameLoopRef.current = setInterval(() => {
        movePiece(0, 1);
      }, Math.max(50, 1000 - (level - 1) * 100));
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameRunning, gamePaused, level, movePiece]);

  // Level progression
  useEffect(() => {
    setLevel(Math.floor(lines / 10) + 1);
  }, [lines]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning || gamePaused) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          rotate();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          pauseGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, gamePaused, movePiece, rotate, pauseGame]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display board
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] && currentPiece.y + y >= 0) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = 8; // Current piece color
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={`w-6 h-6 border border-gray-300 dark:border-gray-600 ${
              cell === 0 ? 'bg-gray-100 dark:bg-gray-800' :
              cell === 1 ? 'bg-cyan-400' :
              cell === 2 ? 'bg-yellow-400' :
              cell === 3 ? 'bg-purple-400' :
              cell === 4 ? 'bg-green-400' :
              cell === 5 ? 'bg-red-400' :
              cell === 6 ? 'bg-blue-400' :
              cell === 7 ? 'bg-orange-400' :
              'bg-gray-300 dark:bg-gray-500'
            }`}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Game Board */}
      <div className="lg:col-span-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Tetris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="relative">
                {renderBoard()}
                
                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-4">Game Over!</h3>
                      <p className="mb-4">Score: {score}</p>
                      <Button onClick={resetGame} variant="outline">
                        Neues Spiel
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Pause Overlay */}
                {gamePaused && !gameOver && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-xl font-bold">Pausiert</h3>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="grid grid-cols-3 gap-2 lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => movePiece(-1, 0)}
                disabled={!gameRunning || gamePaused}
              >
                <ArrowLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rotate}
                disabled={!gameRunning || gamePaused}
              >
                <RotateCw size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => movePiece(1, 0)}
                disabled={!gameRunning || gamePaused}
              >
                <ArrowRight size={16} />
              </Button>
              <div></div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => movePiece(0, 1)}
                disabled={!gameRunning || gamePaused}
              >
                <ArrowDown size={16} />
              </Button>
              <div></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Info & Controls */}
      <div className="space-y-6">
        {/* Score */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-bold">{score}</span>
              </div>
              <div className="flex justify-between">
                <span>Lines:</span>
                <span className="font-bold">{lines}</span>
              </div>
              <div className="flex justify-between">
                <span>Level:</span>
                <span className="font-bold">{level}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Piece */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Nächster Block</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="grid gap-1">
                {PIECES[nextPiece][0].map((row, y) => (
                  <div key={y} className="flex gap-1">
                    {row.map((cell, x) => (
                      <div
                        key={`${y}-${x}`}
                        className={`w-4 h-4 ${
                          cell ? 'bg-primary' : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="glass-card">
          <CardContent className="p-4 space-y-3">
            {!gameRunning ? (
              <Button onClick={startGame} className="w-full">
                <Play size={16} className="mr-2" />
                Neues Spiel
              </Button>
            ) : (
              <Button onClick={pauseGame} className="w-full" variant="outline">
                {gamePaused ? <Play size={16} /> : <Pause size={16} />}
                {gamePaused ? 'Fortsetzen' : 'Pausieren'}
              </Button>
            )}
            
            <Button onClick={resetGame} className="w-full" variant="outline">
              <RotateCcw size={16} className="mr-2" />
              Zurücksetzen
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Steuerung</CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-sm space-y-1">
            <div>← → Bewegen</div>
            <div>↓ Schneller fallen</div>
            <div>↑ / Leertaste Drehen</div>
            <div>P Pausieren</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TetrisGame;