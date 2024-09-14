import React from 'react';
import { test, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import EditorSkeleton from '../src/components/Skeletons/SkeletonEditor';

test('Test src/components/Pane.tsx', async () => {
  render(<EditorSkeleton />);

  expect(await screen.getAllByRole('heading')).toHaveLength(4);
});
