import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './App';

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
});

test('restarts a paused loop with visible status and progress feedback', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Pause animation' }));
  expect(screen.getByRole('status')).toHaveTextContent('Animation paused.');
  expect(
    screen.getByRole('button', { name: 'Resume animation' })
  ).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Restart animation' }));
  expect(screen.getByRole('status')).toHaveTextContent('Animation restarted.');
  expect(
    screen.getByText('Loop progress').nextElementSibling
  ).toHaveTextContent('0%');
  expect(
    screen.getByRole('button', { name: 'Pause animation' })
  ).toBeInTheDocument();
  expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
});

test('exposes a logical page structure and keyboard-operable controls', async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(
    screen.getByRole('heading', {
      level: 1,
      name: 'Build a resilient animation frame loop',
    })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('group', { name: 'Animation controls' })
  ).toBeInTheDocument();

  await user.tab();
  expect(screen.getByRole('button', { name: 'Pause animation' })).toHaveFocus();
  await user.tab();
  expect(
    screen.getByRole('button', { name: 'Restart animation' })
  ).toHaveFocus();
});

test('disables motion when the system preference requests it', async () => {
  const user = userEvent.setup();
  let handlePreferenceChange;
  const mediaQuery = {
    matches: true,
    addEventListener: vi.fn((eventName, callback) => {
      handlePreferenceChange = callback;
    }),
    removeEventListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mediaQuery);

  render(<App />);

  expect(
    screen.getByRole('button', { name: 'Pause animation' })
  ).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent(
    'Animation paused because reduced motion is enabled in system settings.'
  );
  expect(window.requestAnimationFrame).not.toHaveBeenCalled();

  await user.click(screen.getByRole('button', { name: 'Restart animation' }));
  expect(screen.getByRole('status')).toHaveTextContent(
    'Animation reset. Reduced motion keeps it paused.'
  );

  act(() => {
    mediaQuery.matches = false;
    handlePreferenceChange({ matches: false });
  });

  expect(screen.getByRole('button', { name: 'Pause animation' })).toBeEnabled();
  expect(screen.getByRole('status')).toHaveTextContent('Animation restarted.');
  expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
});
