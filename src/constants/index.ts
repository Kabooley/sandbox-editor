/***
 * cssと同値でなくてはならないもの
 * */
// sass/abstracts/_variable.scss
// px
export const $heightOfHeader = 48;
export const $heightOfFooter = 22;
export const $heightOfPaneHeader = 24;
export const $heightOfPaneTitle = 36;

// components/Pane.tsx
export const $minConstraintsOfPaneWidth = 190;
export const $maxConstraintsOfPaneWidth = window.screen.width * 0.26;

// Layout/EditorSection.tsx
export const $minConstraintsOfEditorWidth = 100;
export const $maxConstraintsOfEditorWidth = window.screen.width * 0.7;

// context/LayoutContext.tsxにて使われる。
export const $initialLayout = {
  editorLayout: {
    defaultWidth: 600,
    minimumWidth: $minConstraintsOfEditorWidth,
    maximumWidth: $maxConstraintsOfEditorWidth,
  },
  paneLayout: {
    defaultWidth: 240,
    minimunWidth: $minConstraintsOfPaneWidth,
    maximumWidth: $maxConstraintsOfPaneWidth,
  },
};
