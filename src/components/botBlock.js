import React from 'react';

function BotBlock({ progress }) {
  const percentage = progress * 100;

  return (
    <div className="animation-track" aria-hidden="true">
      <div
        className="bot-block"
        style={{
          left: `${percentage}%`,
          transform: `translateX(-${percentage}%)`,
        }}
      />
    </div>
  );
}

export default BotBlock;
