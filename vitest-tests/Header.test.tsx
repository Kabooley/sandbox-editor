import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import './mocks/matchMedia.mock';
import './mocks/Worker.mock';
import { screen, cleanup } from '@testing-library/react';
import { renderWithProviders } from './utils/react-redux-render-util';
import type { RootState } from '../src/store';
import Header from '../src/components/Header';

const preloadedState: Partial<RootState> = {};

describe('Test Header component', () => {
  beforeEach(() => {});

  afterEach(() => {
    cleanup();
  });

  test('Header should have at least 1 button', async () => {
    renderWithProviders(<Header />, { preloadedState: preloadedState });
    expect(await screen.findAllByRole('button')).toHaveLength(1);
  });
});
