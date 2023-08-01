import React from 'react';
import './ScoreBoard.css';

const ScoreBoard = ({ score, bestScore }) => (
  <div className='container'>
    <p className="mobile-notice">Swiping available only on mobile devices!</p>
    <div className="score-board">
      <div className="title">2048</div>
      <div className="score">
        <h3>Score</h3>
        <p>{score}</p>
      </div>
      <div className="best-score">
        <h3>Best Score</h3>
        <p>{bestScore}</p>
      </div>
    </div>
  </div>
);

export default ScoreBoard;
