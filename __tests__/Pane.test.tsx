/****************************************************************************
 * NOTE:
 * - ScrollableElementを呼び出すと面倒なのでモックしている
 * - モックを使う関係上、ScrollableElementとPaneを動的importしている
 * - [未検証]　mock対象のReactコンポーネントを、動的importするかLazy(() => import())するかでmockオブジェクトの内容が変わるみたい
 *
 * **************************************************************************/
import React from 'react';
import './mocks/matchMedia.mock';
import './mocks/Worker.mock';
import { test, expect, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './utils/test-utils';
import type { RootState } from '../src/store';
jest.unstable_mockModule(
  '../src/components/ScrollableElement/index.tsx',
  () => {
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
      // Optional function fires when onmousedown on scrollbar thumb
      onDragStart?: () => void;
      // Optional function fires when onmouseup
      onDragEnd?: () => void;
      // Set true if you wanna disable horizontal scrollbar.
      disableHorizontalScrollbar?: boolean;
      // Set true if you wanna disable vertical scrollbar.
      disableVerticalScrollbar?: boolean;
      // Optional styles of scrollbars
      optionalStyles?: {
        verticalScrollbarThumbWidth?: number;
        horizontalScrollbarThumbHeight?: number;
      };
    }
    const mockedScrollableElement = jest
      .fn<(props: iProps) => JSX.Element>()
      .mockImplementation((props: iProps) => {
        return <div></div>;
      });
    return {
      ScrollableElement: mockedScrollableElement,
    };
  }
);
// const ScrollableElement = await React.lazy(
//   () => import('../src/components/ScrollableElement/index')
// );
const ScrollableElement = await import(
  '../src/components/ScrollableElement/index'
);
// const Pane = await import('../src/components/Pane');
const Pane = await React.lazy(() => import('../src/components/Pane'));

const preloadedState: Partial<RootState> = {};

describe('Test Pane', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    console.log(ScrollableElement);
    (ScrollableElement as jest.Mock).mockClear();
  });

  test('Pane should have 4 Headings when initialized', () => {
    renderWithProviders(<Pane />, {
      preloadedState: preloadedState,
    });

    expect(screen.getAllByRole('heading')).toHaveLength(4);
  });
});
