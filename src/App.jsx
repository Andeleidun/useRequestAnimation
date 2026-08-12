import { useState } from 'react';
import BotBlock from './components/BotBlock';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useRequestAnimationFrame } from './hooks/useRequestAnimationFrame';
import './App.css';

const LOOP_DURATION_MS = 2400;

function App() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isRunning, setIsRunning] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastAction, setLastAction] = useState('initial');
  const canAnimate = isRunning && !prefersReducedMotion;

  useRequestAnimationFrame(
    ({ deltaMs }) => {
      setElapsedMs((current) => (current + deltaMs) % LOOP_DURATION_MS);
    },
    { isRunning: canAnimate }
  );

  let statusMessage;
  if (prefersReducedMotion) {
    statusMessage =
      lastAction === 'restart'
        ? 'Animation reset. Reduced motion keeps it paused.'
        : 'Animation paused because reduced motion is enabled in system settings.';
  } else if (lastAction === 'restart') {
    statusMessage = 'Animation restarted.';
  } else if (lastAction === 'resume') {
    statusMessage = 'Animation resumed.';
  } else {
    statusMessage = isRunning ? 'Animation running.' : 'Animation paused.';
  }

  const toggleAnimation = () => {
    const next = !isRunning;
    setIsRunning(next);
    setLastAction(next ? 'resume' : 'pause');
  };

  const restartAnimation = () => {
    setElapsedMs(0);
    setLastAction('restart');
  };

  return (
    <div className="App container">
      <header>
        <h1>React Custom Animation Hook Tutorial</h1>
      </header>
      <main>
        <p>
          This block advances from browser-supplied frame timestamps. Pause,
          resume, or restart it while the hook owns frame cleanup.
        </p>
        <BotBlock progress={elapsedMs / LOOP_DURATION_MS} />
        <div className="button-group">
          <button
            type="button"
            onClick={toggleAnimation}
            disabled={prefersReducedMotion}
          >
            {isRunning ? 'Pause animation' : 'Resume animation'}
          </button>
          <button type="button" onClick={restartAnimation}>
            Restart animation
          </button>
        </div>
        <p role="status" aria-atomic="true">
          {statusMessage}
        </p>
      </main>
    </div>
  );
}

export default App;
