import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe title and allows a move', () => {
  render(<App />);
  const title = screen.getByText(/Tic Tac Toe/i);
  expect(title).toBeInTheDocument();

  // Make sure squares exist and are clickable
  const cells = screen.getAllByRole('button', { name: /Cell/i });
  expect(cells.length).toBe(9);

  // Click first empty cell, should show X
  fireEvent.click(cells[0]);
  expect(cells[0]).toHaveTextContent('X');
});
