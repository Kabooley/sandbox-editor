import React from 'react';
import './mocks/matchMedia.mock';
import './mocks/Worker.mock';
import { jest, describe, test } from '@jest/globals';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './utils/test-utils';
import type { RootState } from '../src/store';

import Header from '../src/components/Header';

const preloadedState: Partial<RootState> = {};

describe('Test Header', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  test('Should have menu button', () => {
    renderWithProviders(<Header />, { preloadedState: preloadedState });
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
