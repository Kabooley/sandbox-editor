import React from 'react';
import { describe, test, expect, vi, beforeEach, afterAll } from 'vitest';
import './mocks/matchMedia.mock';
import './mocks/Worker.mock';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../__tests__/utils/test-utils';
import type { RootState } from '../src/store';
import Dependencies from '../src/components/VSCodeExplorer/Dependencies';

// Param types of Dependencies.
// Transcribed from Dependencies/index.tsx
interface iProps {
  id: number;
  collapse: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  height: number;
  width: number;
}

/***
 * Add default property if mocking default exported module.
 *
 * https://vitest.dev/api/vi#vi-mock
 * */
vi.mock(import('../src/components/ScrollableElement'), () => {
  interface iProps {
    // Parent's width
    width: number;
    // Parent's height
    height: number;
    // Anything that lets know that the parent container has been resized
    onChildrenResizeEvent: any;
    // Anything that lets know that the parent container has been resized
    onParentResizeEvent: any;
    // Wrapped components
    children: any;
  }

  const mockedScrollableElement = ({ width, height, ...rest }: iProps) => {
    return (
      <div style={{ width: width, height: height, overflow: 'hidden' }}></div>
    );
  };
  return {
    default: mockedScrollableElement,
    namedExport: mockedScrollableElement,
  };
});

const preloadedState: Partial<RootState> = {};

const propsTemplate: iProps = {
  id: 1,
  collapse: false,
  onClick: vi.fn().mockImplementation((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  }),
  height: 400,
  width: 300,
};

/*****
 *
 *
 *
 * */
describe('Test fetching new dependency from VSCodeExplorer Dependency form', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {});
  afterAll(() => {
    vi.clearAllMocks();
  });

  /***
   * - Get axios@1.6.7 by fetch requesting
   * - Updating package.json dependencies correctly.
   * - Updating list of Dependencies stack's body that including axios.
   *
   * */
  test('Request axios@1.6.7 and saved correctly', async () => {
    renderWithProviders(<Dependencies {...propsTemplate} />, {
      preloadedState: preloadedState,
    });

    // formへ依存関係を入力
    // エンターキー
    // listにaxios@1.6.7が追加されるのを確認
    // リクエストの結果を待つ
    // リクエストの結果を受信してtypingLibsSliceのstateを更新
    // package.jsonがこうしんされるｂ
    // 結果に応じてlistが確定される
  });
});
