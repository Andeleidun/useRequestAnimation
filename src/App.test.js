import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
});

test('pauses and restarts the animation with visible status feedback', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Pause animation' }));
  expect(screen.getByRole('status')).toHaveTextContent('Animation paused.');
  expect(
    screen.getByRole('button', { name: 'Resume animation' })
  ).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Restart animation' }));
  expect(screen.getByRole('status')).toHaveTextContent('Animation restarted.');
});

test('disables motion when the system preference requests it', () => {
  let handlePreferenceChange;
  const mediaQuery = {
    matches: true,
    addEventListener: jest.fn((eventName, callback) => {
      handlePreferenceChange = callback;
    }),
    removeEventListener: jest.fn(),
  };
  window.matchMedia = jest.fn().mockReturnValue(mediaQuery);

  render(<App />);

  expect(
    screen.getByRole('button', { name: 'Pause animation' })
  ).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent(
    'Animation paused because reduced motion is enabled in system settings.'
  );
  expect(window.requestAnimationFrame).not.toHaveBeenCalled();

  act(() => {
    mediaQuery.matches = false;
    handlePreferenceChange({ matches: false });
  });

  expect(screen.getByRole('button', { name: 'Pause animation' })).toBeEnabled();
  expect(screen.getByRole('status')).toHaveTextContent('Animation running.');
  expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
});
