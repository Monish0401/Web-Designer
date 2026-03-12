jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders start designing heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/start designing/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders export button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/export html/i);
  expect(buttonElement).toBeInTheDocument();
});
