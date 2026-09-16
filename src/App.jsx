import { useState } from 'react';
import BotBlock from './components/BotBlock';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useRequestAnimationFrame } from './hooks/useRequestAnimationFrame';
import './App.css';

const LOOP_DURATION_MS = 2400;
const MAX_DELTA_MS = 100;

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
    { isRunning: canAnimate, maxDeltaMs: MAX_DELTA_MS }
  );

  const progress = elapsedMs / LOOP_DURATION_MS;
  const progressPercentage = Math.round(progress * 100);

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
    setIsRunning(true);
    setLastAction('restart');
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">React hook field guide</p>
        <h1>Build a resilient animation frame loop</h1>
        <p className="hero-summary">
          Drive motion from browser timestamps, keep the latest React callback,
          and clean up every scheduled frame without restarting the loop on
          ordinary renders.
        </p>
        <ul className="feature-list" aria-label="Example characteristics">
          <li>React 19</li>
          <li>Timestamp driven</li>
          <li>Reduced motion aware</li>
        </ul>
      </header>
      <main>
        <section className="demo-card" aria-labelledby="demo-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Live behavior</p>
              <h2 id="demo-title">A loop you can interrupt safely</h2>
            </div>
            <span className={`state-badge ${canAnimate ? 'is-running' : ''}`}>
              {canAnimate ? 'Running' : 'Paused'}
            </span>
          </div>
          <p className="demo-intro">
            The block completes one loop every 2.4 seconds. Pause, resume, or
            restart it while the hook owns scheduling and cleanup.
          </p>

          <BotBlock progress={progress} />

          <dl className="readout" aria-label="Animation policy">
            <div>
              <dt>Loop progress</dt>
              <dd>{progressPercentage}%</dd>
            </div>
            <div>
              <dt>Maximum frame delta</dt>
              <dd>{MAX_DELTA_MS} ms</dd>
            </div>
            <div>
              <dt>Motion preference</dt>
              <dd>{prefersReducedMotion ? 'Reduce' : 'No preference'}</dd>
            </div>
          </dl>

          <div
            className="button-group"
            role="group"
            aria-label="Animation controls"
          >
            <button
              type="button"
              onClick={toggleAnimation}
              disabled={prefersReducedMotion}
            >
              {isRunning ? 'Pause animation' : 'Resume animation'}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={restartAnimation}
            >
              Restart animation
            </button>
          </div>
          <p className="status-message" role="status" aria-atomic="true">
            {statusMessage}
          </p>
        </section>

        <section className="guarantees" aria-labelledby="guarantees-title">
          <p className="section-kicker">Hook contract</p>
          <h2 id="guarantees-title">Three guarantees worth testing</h2>
          <div className="guarantee-grid">
            <article>
              <span className="guarantee-number">01</span>
              <h3>Current callback</h3>
              <p>
                An Effect Event reads the latest callback without making the
                scheduling effect restart after every render.
              </p>
            </article>
            <article>
              <span className="guarantee-number">02</span>
              <h3>Bounded resume</h3>
              <p>
                A configurable delta cap prevents one delayed frame from
                applying the entire pause as movement.
              </p>
            </article>
            <article>
              <span className="guarantee-number">03</span>
              <h3>Exact cleanup</h3>
              <p>
                Pausing, changing policy, and unmounting cancel the most recent
                request identifier.
              </p>
            </article>
          </div>
        </section>
      </main>
      <footer>
        <p>
          Explore the implementation in <code>src/hooks</code>, then follow the
          complete walkthrough in <code>article/tutorial.md</code>.
        </p>
      </footer>
    </div>
  );
}

export default App;
