// jest.mock('uuid', () => ({
//   v4: () => 'test-uuid-1234',
// }));

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// test('renders start designing heading', () => {
test('renders empty canvas state heading', () => {
  render(<App />);
  // const headingElement = screen.getByText(/start designing/i);
  const headingElement = screen.getByText(/welcome to canvas editor/i);
  expect(headingElement).toBeInTheDocument();
});

// test('renders export button', () => {
test('renders export actions in top controls', () => {
  
  render(<App />);
  expect(screen.getByRole('button', { name: /html/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /zip/i })).toBeInTheDocument();
  // const buttonElement = screen.getByText(/export html/i);
  // expect(buttonElement).toBeInTheDocument();
});
