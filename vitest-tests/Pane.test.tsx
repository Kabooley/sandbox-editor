import React from 'react';
import { describe, test, expect, vi, beforeEach, afterAll } from 'vitest';
import './mocks/matchMedia.mock';
import './mocks/Worker.mock';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './utils/react-redux-render-util';
import type { RootState } from '../src/store';
import Pane from '../src/components/Pane';

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

/***
 * TODO:
 * - Should have 4 headings. Explorer, OPENEDITOR, VIRTUALFOLDER, DEPENDENCIES
 * - Should open body of the OPENEDITOR
 * - Should close body of the OPENEDITOR if it is opening body
 * - Should open body of the VRITUALFOLDER
 * - Should close body of the VIRTUALFOLDER if it is opening body
 * - Should open body of the DEPENDECIES
 * - Should close body of the DEPENDENCIES if it is opening body
 * - Height should always fits between header and footer
 * - Should have no actions on OPENEDITOR title stack if body is collapsing
 * - Should have actions on OPENEDITOR title stack if body is opening
 * - Should have no actions on VIRTUALFOLDER title stack if body is collapsing
 * - Should have actions on VIRTUALFOLDER title stack if body is opening
 *
 * */
describe('Test Pane component', () => {
  beforeEach(() => {});

  afterAll(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  test('Should have 4 headings', async () => {
    renderWithProviders(<Pane />, { preloadedState: preloadedState });
    expect(await screen.findAllByRole('heading')).toHaveLength(4);
  });

  // test('Should open body of the OPENEDITOR', () => {
  //   renderWithProviders(<Pane />, { preloadedState: preloadedState });
  //   // expect().toBe();
  // });
  // test('Should close body of the OPENEDITOR if it is opening body', () => {
  //   renderWithProviders(<Pane />, { preloadedState: preloadedState });
  //   // expect().toBe();
  // });
  // test('Should open body of the VRITUALFOLDER', () => {
  //   renderWithProviders(<Pane />, { preloadedState: preloadedState });
  //   // expect().toBe();
  // });
  // test('Should close body of the VIRTUALFOLDER if it is opening body', () => {
  //   renderWithProviders(<Pane />, { preloadedState: preloadedState });
  //   // expect().toBe();
  // });
  // test('Should open body of the DEPENDECIES', () => {
  //   renderWithProviders(<Pane />, { preloadedState: preloadedState });
  //   // expect().toBe();
  // });
  // test('Should close body of the DEPENDENCIES if it is opening body', () => {
  //   renderWithProviders(<Pane />, { preloadedState: preloadedState });
  //   // expect().toBe();
  // });
  // test('Height should always fits between header and footer', () => {
  //   renderWithProviders(<Pane />, { preloadedState: preloadedState });
  //   // expect().toBe();
  // });

  // test('Should have no actions on OPENEDITOR title stack if body is collapsing', () => {
  //   renderWithProviders(<Pane />, { preloadedState: preloadedState });
  //   // expect().toBe();
  // });
  // test('Should have actions on OPENEDITOR title stack if body is opening', () => {
  //   renderWithProviders(<Pane />, { preloadedState: preloadedState });
  //   //  expect().toBe();
  // });
  // test('Should have no actions on VIRTUALFOLDER title stack if body is collapsing', () => {
  //   renderWithProviders(<Pane />, { preloadedState: preloadedState });
  //   //  expect().toBe();
  // });
  // test('Should have actions on VIRTUALFOLDER title stack if body is opening', () => {
  //   renderWithProviders(<Pane />, { preloadedState: preloadedState });
  //   //  expect().toBe();
  // });
});
