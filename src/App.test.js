import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Tutorial title', () => {
  render(<App />);
  const linkElement = screen.getByText(/Tutorial/i);
  expect(linkElement).toBeInTheDocument();
});