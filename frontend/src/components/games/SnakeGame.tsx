import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pause, Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLeaderboard } from '@/contexts/LeaderboardContext';

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const GAME_SPEED = 150;

interface Position {
  x: number;
  y: number;
}

interface Direction {
  x: number;
  y: number;
}

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>(DIRECTIONS.RIGHT);
  const [gameRunning, setGameRunning] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snake-high-score') || '0');
  });
  const { addEntry } = useLeaderboard();
  
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const directionRef = useRef(direction);
  const postedRef = useRef(false);

  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (2**32) * BOARD_SIZE),
        y: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (2**32) * BOARD_SIZE)
      };
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(DIRECTIONS.RIGHT);
    directionRef.current = DIRECTIONS.RIGHT;
    setScore(0);
    setGameOver(false);
    setGameRunning(false);
    setGamePaused(false);
    postedRef.current = false;
  }, [generateFood]);

  const startGame = useCallback(() => {
    resetGame();
    setGameRunning(true);
  }, [resetGame]);

  const pauseGame = useCallback(() => {
    setGamePaused(!gamePaused);
  }, [gamePaused]);

  const changeDirection = useCallback((newDirection: Direction) => {
    if (gameRunning && !gamePaused && !gameOver) {
      // Prevent reversing into itself
      if (
        (directionRef.current.x === -newDirection.x && directionRef.current.y === -newDirection.y)
      ) {
        return;
      }
      directionRef.current = newDirection;
      setDirection(newDirection);
    }
  }, [gameRunning, gamePaused, gameOver]);

  const moveSnake = useCallback(() => {
    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += directionRef.current.x;
      head.y += directionRef.current.y;

      // Check wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        setGameRunning(false);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setGameRunning(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snake-high-score', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood, highScore]);

  // Post score to leaderboard exactly once on game over
  useEffect(() => {
    if (gameOver && !postedRef.current && score > 0) {
      postedRef.current = true;
      addEntry({ game: 'Snake', score });
    }
  }, [gameOver, score, addEntry]);

  // Game loop
  useEffect(() => {
    if (gameRunning && !gamePaused && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
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
  }, [gameRunning, gamePaused, gameOver, moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection(DIRECTIONS.UP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection(DIRECTIONS.DOWN);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection(DIRECTIONS.LEFT);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection(DIRECTIONS.RIGHT);
          break;
        case ' ':
        case 'p':
        case 'P':
          e.preventDefault();
          if (gameRunning) pauseGame();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          startGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [changeDirection, pauseGame, startGame, gameRunning]);

  const renderBoard = () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    
    // Place snake
    snake.forEach((segment, index) => {
      if (segment.x >= 0 && segment.x < BOARD_SIZE && segment.y >= 0 && segment.y < BOARD_SIZE) {
        board[segment.y][segment.x] = index === 0 ? 2 : 1; // 2 for head, 1 for body
      }
    });
    
    // Place food
    if (food.x >= 0 && food.x < BOARD_SIZE && food.y >= 0 && food.y < BOARD_SIZE) {
      board[food.y][food.x] = 3;
    }

    return board.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={`w-4 h-4 border border-gray-200 dark:border-gray-700 ${
              cell === 0 ? 'bg-gray-100 dark:bg-gray-800' :
              cell === 1 ? 'bg-green-400' :
              cell === 2 ? 'bg-green-600' :
              'bg-red-400'
            }`}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Game Board */}
      <div className="lg:col-span-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Snake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="relative">
                {renderBoard()}
                
                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                      <p className="mb-2">Score: {score}</p>
                      {score === highScore && score > 0 && (
                        <p className="mb-4 text-yellow-400">🎉 Neuer Highscore!</p>
                      )}
                      <Button onClick={startGame} variant="outline">
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
              <div></div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDirection(DIRECTIONS.UP)}
                disabled={!gameRunning || gamePaused}
              >
                <ArrowUp size={16} />
              </Button>
              <div></div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDirection(DIRECTIONS.LEFT)}
                disabled={!gameRunning || gamePaused}
              >
                <ArrowLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDirection(DIRECTIONS.DOWN)}
                disabled={!gameRunning || gamePaused}
              >
                <ArrowDown size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDirection(DIRECTIONS.RIGHT)}
                disabled={!gameRunning || gamePaused}
              >
                <ArrowRight size={16} />
              </Button>
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
                <span>High Score:</span>
                <span className="font-bold text-primary">{highScore}</span>
              </div>
              <div className="flex justify-between">
                <span>Länge:</span>
                <span className="font-bold">{snake.length}</span>
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
            <div>Pfeiltasten oder WASD</div>
            <div>Leertaste / P: Pausieren</div>
            <div>R: Neues Spiel</div>
            <div className="pt-2 text-xs text-muted-foreground">
              Sammle rote Punkte und vermeide Wände und deinen eigenen Körper!
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SnakeGame;