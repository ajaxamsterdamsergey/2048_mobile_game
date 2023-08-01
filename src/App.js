import React, { useState, useEffect, useCallback } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useSwipeable } from 'react-swipeable';
import ScoreBoard from './components/ScoreBoard/ScoreBoard';
import './App.css';

const ROWS = 4;
const COLS = 4;

const App = () => {
  const [board, setBoard] = useState(new Array(ROWS).fill([]).map(() => new Array(COLS).fill(0)));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return localStorage.getItem('bestScore') || 0;
  });

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('bestScore', score);
    }
  }, [score, bestScore]);

  const addRandomTile = useCallback(() => {
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      const availableCells = [];

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (newBoard[row][col] === 0) {
            availableCells.push({ row, col });
          }
        }
      }

      if (availableCells.length > 0) {
        const { row, col } = availableCells[Math.floor(Math.random() * availableCells.length)];
        newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
      }

      return newBoard;
    });
  }, []);

  useEffect(() => {
    addRandomTile();
    addRandomTile();
  }, [addRandomTile]);

  const handleSwipe = useCallback((direction) => {
    setBoard((prevBoard) => {
      let newBoard = [...prevBoard];
      let moved = false;

      const slideRow = (row, direction) => {
        const arr = row.filter(val => val);
        const missing = { length: COLS - arr.length };
        const zeros = Array(missing.length).fill(0);
        const newRow = direction === 'right' ? zeros.concat(arr) : arr.concat(zeros);
        return newRow;
      }
      
      const combineRow = (row, direction) => {
        const arr = direction === 'right' ? row.reverse() : row;
        let points = 0;
      
        for (let i = COLS - 1; i >= 1 ; i--) {
          let a = arr[i];
          let b = arr[i - 1];
      
          if (a === b) {
            const merged = a + b;
            arr[i] = merged;
            arr[i - 1] = 0;
            points += merged;
            i--;
          }
        }
      
        setScore((prevScore) => prevScore + points);
      
        return direction === 'right' ? arr.reverse() : arr;
      }
      
      
      
      

      switch (direction) {
        case 'up':
        case 'down':
          const transposed = newBoard[0].map((col, i) => newBoard.map(row => row[i]));
          const ordered = transposed.map(row => direction === 'up' ? slideRow(row) : slideRow(row).reverse());
          const combined = ordered.map(row => combineRow(row));
          const finalBoard = combined.map(row => direction === 'up' ? slideRow(row) : slideRow(row).reverse());
          newBoard = finalBoard[0].map((col, i) => finalBoard.map(row => row[i]));
          break;
        case 'left':
        case 'right':
          const orderedRows = newBoard.map(row => slideRow(row, direction));
          const combinedRows = orderedRows.map(row => combineRow(row, direction));
          newBoard = combinedRows.map(row => slideRow(row, direction));

          break;
        default:
          break;
      }

      if (JSON.stringify(newBoard) !== JSON.stringify(prevBoard)) {
        moved = true;
      }

      if (moved) {
        addRandomTile();
      }

      return newBoard;
    });
  }, [addRandomTile]);

  const swipeHandlers = useSwipeable({
    onSwipedUp: () => handleSwipe('up'),
    onSwipedDown: () => handleSwipe('down'),
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
  });

  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'ArrowUp':
        handleSwipe('up');
        break;
      case 'ArrowDown':
        handleSwipe('down');
        break;
      case 'ArrowLeft':
        handleSwipe('left');
        break;
      case 'ArrowRight':
        handleSwipe('right');
        break;
      default:
        break;
    }
  }, [handleSwipe]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const renderTiles = () => {
    return board.map((row, rowIndex) =>
      row.map((value, colIndex) => (
        <TransitionGroup key={`${rowIndex}-${colIndex}-group`}>
          <CSSTransition
            key={`${rowIndex}-${colIndex}`}
            timeout={1700}
            classNames="tile"
          >
            <div
              key={`${rowIndex}-${colIndex}-tile`}
              className={`tile tile-${value}`}
            >
              {value > 0 && value}
            </div>
          </CSSTransition>
        </TransitionGroup>
      ))
    );
  };
  

  return (
    <div className='wrapper'>
      <ScoreBoard score={score} bestScore={bestScore} />
      <div className="app" {...swipeHandlers}>
        {renderTiles()}
      </div>
    </div>
  );
};

export default App;
