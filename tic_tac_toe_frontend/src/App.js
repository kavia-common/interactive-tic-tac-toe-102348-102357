import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * App: Main component rendering a complete 2-player Tic Tac Toe game.
 * - Renders a 3x3 board
 * - Handles player turns (X / O)
 * - Detects win and draw states
 * - Allows resetting/restarting the game
 * - Manages simple light/dark theme toggle for nicer UX
 */
function App() {
  // Theme for nicer UI
  const [theme, setTheme] = useState('light');

  // Game state
  // Board squares as an array of 9 cells: null | 'X' | 'O'
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null); // null | 'X' | 'O'
  const [winningLine, setWinningLine] = useState([]); // e.g., [0,1,2]
  const [moveCount, setMoveCount] = useState(0);

  // Apply theme to document root attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Calculate game status using useMemo for efficiency/readability
  const status = useMemo(() => {
    const { winner: w, line } = calculateWinner(squares);
    if (w) {
      return { label: `Winner: ${w}`, winner: w, line, draw: false };
    }
    if (moveCount === 9) {
      return { label: 'Draw! No more moves.', winner: null, line: [], draw: true };
    }
    return { label: `Next Player: ${xIsNext ? 'X' : 'O'}`, winner: null, line: [], draw: false };
  }, [squares, xIsNext, moveCount]);

  useEffect(() => {
    // Sync derived status to local state flags to simplify rendering conditions
    setWinner(status.winner);
    setWinningLine(status.line);
    setIsGameOver(Boolean(status.winner) || status.draw);
  }, [status]);

  // PUBLIC_INTERFACE
  const handleClick = (index) => {
    if (isGameOver || squares[index] !== null) return; // Ignore if game ended or cell taken

    const nextSquares = squares.slice();
    nextSquares[index] = xIsNext ? 'X' : 'O';

    setSquares(nextSquares);
    setXIsNext(!xIsNext);
    setMoveCount(prev => prev + 1);
  };

  // PUBLIC_INTERFACE
  const resetBoard = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setIsGameOver(false);
    setWinner(null);
    setWinningLine([]);
    setMoveCount(0);
  };

  // PUBLIC_INTERFACE
  const restartGame = () => {
    // Restart preserves theme but resets the board
    resetBoard();
  };

  const highlightClass = (idx) => (winningLine.includes(idx) ? 'square highlight' : 'square');

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <div className="game-container" role="application" aria-label="Tic Tac Toe game">
          <h1 className="title">Tic Tac Toe</h1>

          <div
            className={`status ${winner ? 'status-win' : status.draw ? 'status-draw' : ''}`}
            aria-live="polite"
          >
            {status.label}
          </div>

          <Board
            squares={squares}
            onClick={handleClick}
            highlightLine={winningLine}
            isGameOver={isGameOver}
          />

          <div className="controls">
            <button className="btn" onClick={resetBoard} aria-label="Reset Board">
              Reset Board
            </button>
            <button className="btn btn-secondary" onClick={restartGame} aria-label="Restart Game">
              Restart Game
            </button>
          </div>

          <HowToPlay />
        </div>
      </header>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Board: Renders a 3x3 grid of squares.
 * Props:
 * - squares: string[] (length 9) with values 'X' | 'O' | null
 * - onClick: (index:number) => void (handler when a square is clicked)
 * - highlightLine: number[] winning line indices to highlight
 * - isGameOver: boolean to set disabled state for accessibility
 */
function Board({ squares, onClick, highlightLine, isGameOver }) {
  const renderSquare = (i) => {
    const value = squares[i];
    const isWinningCell = highlightLine.includes(i);

    return (
      <button
        key={i}
        className={`square ${isWinningCell ? 'highlight' : ''} ${value ? 'filled' : ''}`}
        onClick={() => onClick(i)}
        disabled={isGameOver || value !== null}
        aria-label={`Cell ${i + 1}, ${value ? value : 'empty'}`}
      >
        <span className={`mark ${value === 'X' ? 'mark-x' : value === 'O' ? 'mark-o' : ''}`}>
          {value}
        </span>
      </button>
    );
  };

  return (
    <div className="board" role="grid" aria-label="Tic Tac Toe board">
      {[0, 1, 2].map((row) => (
        <div className="board-row" role="row" key={row}>
          {[0, 1, 2].map((col) => renderSquare(row * 3 + col))}
        </div>
      ))}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * HowToPlay: Simple helper section showing usage tips.
 */
function HowToPlay() {
  return (
    <div className="howto">
      <h2 className="subtitle">How to Play</h2>
      <ul className="instructions">
        <li>Two players take turns. Player X starts.</li>
        <li>Click an empty square to place your mark.</li>
        <li>Get three of your marks in a row (horizontal, vertical, or diagonal) to win.</li>
        <li>If all squares are filled and no one wins, it’s a draw.</li>
        <li>Use Reset to clear the board; Restart behaves the same for this local game.</li>
      </ul>
    </div>
  );
}

/**
 * Helper: Determine winner and winning line.
 * Returns: { winner: 'X' | 'O' | null, line: number[] }
 */
function calculateWinner(squares) {
  const lines = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Cols
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: [] };
}

export default App;
