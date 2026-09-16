function BotBlock({ progress }) {
  const boundedProgress = Math.min(Math.max(progress, 0), 1);
  const percentage = boundedProgress * 100;

  return (
    <div className="animation-track" aria-hidden="true">
      <span className="track-label track-label-start">Start</span>
      <span className="track-label track-label-finish">Loop</span>
      <div
        className="bot-block"
        style={{
          left: `${percentage}%`,
          transform: `translateX(-${percentage}%)`,
        }}
      >
        <span>rAF</span>
      </div>
    </div>
  );
}

export default BotBlock;
