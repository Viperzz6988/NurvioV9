import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, User, Bot, Trophy } from 'lucide-react';

type Player = 'X' | 'O' | 'draw' | null;
type Board = Player[];
type GameMode = 'pvp' | 'ai';
type Difficulty = 'easy' | 'medium' | 'hard';

interface GameStats {
  wins: number;
  losses: number;
  draws: number;
}

const TicTacToeGame: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isGameActive, setIsGameActive] = useState(true);
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('tictactoe-stats');
    return saved ? JSON.parse(saved) : { wins: 0, losses: 0, draws: 0 };
  });

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  const checkWinner = useCallback((board: Board): Player => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    
    if (board.every(cell => cell !== null)) {
      return 'draw' as Player;
    }
    
    return null;
  }, [winningCombinations]);

  const getAvailableMoves = useCallback((board: Board): number[] => {
    return board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
  }, []);

  const minimax = useCallback((board: Board, depth: number, isMaximizing: boolean, alpha: number = -Infinity, beta: number = Infinity): number => {
    const result = checkWinner(board);
    
    if (result === 'O') return 10 - depth; // AI wins
    if (result === 'X') return depth - 10; // Human wins
    if (result === 'draw') return 0;
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of getAvailableMoves(board)) {
        const newBoard = [...board];
        newBoard[move] = 'O';
        const evaluation = minimax(newBoard, depth + 1, false, alpha, beta);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of getAvailableMoves(board)) {
        const newBoard = [...board];
        newBoard[move] = 'X';
        const evaluation = minimax(newBoard, depth + 1, true, alpha, beta);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }, [checkWinner, getAvailableMoves]);

  const getBestMove = useCallback((board: Board, difficulty: Difficulty): number => {
    const availableMoves = getAvailableMoves(board);
    
    if (availableMoves.length === 0) return -1;
    
    // Easy: Random move
    if (difficulty === 'easy') {
      return availableMoves[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (2**32) * availableMoves.length)];
    }
    
    // Medium: Mix of random and optimal
    if (difficulty === 'medium') {
      const random = crypto.getRandomValues(new Uint32Array(1))[0] / (2**32);
      if (random < 0.3) {
        return availableMoves[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (2**32) * availableMoves.length)];
      }
    }
    
    // Hard or medium with optimal move: Use minimax
    let bestMove = availableMoves[0];
    let bestValue = -Infinity;
    
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = 'O';
      const moveValue = minimax(newBoard, 0, false);
      
      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = move;
      }
    }
    
    return bestMove;
  }, [getAvailableMoves, minimax]);

  const makeMove = useCallback((index: number) => {
    if (board[index] || winner || !isGameActive) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setIsGameActive(false);
      
      // Update stats for AI mode
      if (gameMode === 'ai') {
        const newStats = { ...stats };
        if (gameWinner === 'X') newStats.wins++;
        else if (gameWinner === 'O') newStats.losses++;
        else newStats.draws++;
        
        setStats(newStats);
        localStorage.setItem('tictactoe-stats', JSON.stringify(newStats));
      }
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  }, [board, currentPlayer, winner, isGameActive, checkWinner, gameMode, stats]);

  // AI move
  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === 'O' && !winner && isGameActive) {
      const timer = setTimeout(() => {
        const aiMove = getBestMove(board, difficulty);
        if (aiMove !== -1) {
          makeMove(aiMove);
        }
      }, 500); // Small delay for better UX

      return () => clearTimeout(timer);
    }
  }, [gameMode, currentPlayer, winner, isGameActive, board, difficulty, getBestMove, makeMove]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsGameActive(true);
  }, []);

  const switchMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    resetGame();
  }, [resetGame]);

  const getWinnerDisplay = () => {
    if (winner === 'draw') return 'Unentschieden!';
    if (gameMode === 'ai') {
      if (winner === 'X') return 'Du gewinnst! 🎉';
      if (winner === 'O') return 'KI gewinnt! 🤖';
    }
    return winner ? `Spieler ${winner} gewinnt!` : null;
  };

  const getCellContent = (index: number) => {
    const value = board[index];
    if (!value) return '';
    
    return (
      <span className={`text-4xl font-bold ${
        value === 'X' ? 'text-blue-500' : 'text-red-500'
      }`}>
        {value}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Game Board */}
      <div className="lg:col-span-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tic Tac Toe</span>
              {winner && (
                <Badge variant={winner === 'X' ? 'default' : winner === 'O' ? 'destructive' : 'secondary'}>
                  {getWinnerDisplay()}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mb-6">
              {board.map((_, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 w-20 text-4xl font-bold hover:bg-muted/50"
                  onClick={() => makeMove(index)}
                  disabled={!!board[index] || !!winner || !isGameActive || (gameMode === 'ai' && currentPlayer === 'O')}
                >
                  {getCellContent(index)}
                </Button>
              ))}
            </div>

            {!winner && isGameActive && (
              <div className="text-center mb-4">
                <p className="text-lg">
                  {gameMode === 'pvp' 
                    ? `Spieler ${currentPlayer} ist dran`
                    : currentPlayer === 'X' 
                      ? 'Du bist dran (X)'
                      : 'KI denkt nach... 🤔'
                  }
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <Button onClick={resetGame} variant="outline">
                <RotateCcw size={16} className="mr-2" />
                Neues Spiel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Controls & Stats */}
      <div className="space-y-6">
        {/* Game Mode */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Spielmodus</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Button
              variant={gameMode === 'pvp' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => switchMode('pvp')}
            >
              <User size={16} className="mr-2" />
              Spieler vs Spieler
            </Button>
            <Button
              variant={gameMode === 'ai' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => switchMode('ai')}
            >
              <Bot size={16} className="mr-2" />
              Spieler vs KI
            </Button>
          </CardContent>
        </Card>

        {/* AI Difficulty */}
        {gameMode === 'ai' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">KI Schwierigkeit</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <Button
                  key={level}
                  variant={difficulty === level ? 'default' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() => setDifficulty(level)}
                  disabled={isGameActive && currentPlayer === 'O'}
                >
                  {level === 'easy' ? 'Einfach' : level === 'medium' ? 'Mittel' : 'Schwer'}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {gameMode === 'ai' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Trophy size={16} className="mr-2" />
                Statistiken
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Siege:</span>
                  <span className="font-bold text-green-600">{stats.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span>Niederlagen:</span>
                  <span className="font-bold text-red-600">{stats.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unentschieden:</span>
                  <span className="font-bold text-yellow-600">{stats.draws}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span>Gesamt:</span>
                    <span className="font-bold">{stats.wins + stats.losses + stats.draws}</span>
                  </div>
                  {stats.wins + stats.losses > 0 && (
                    <div className="flex justify-between">
                      <span>Siegrate:</span>
                      <span className="font-bold">
                        {Math.round((stats.wins / (stats.wins + stats.losses)) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Spielregeln</CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-sm text-muted-foreground space-y-1">
            <p>Versuche drei deiner Zeichen in eine Reihe zu bekommen:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Horizontal</li>
              <li>Vertikal</li>
              <li>Diagonal</li>
            </ul>
            <p className="pt-2">Du spielst als X, die KI als O.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicTacToeGame;