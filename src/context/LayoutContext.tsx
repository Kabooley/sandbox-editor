/***
 *　Decides state of app Layout.
 *
 * */
import React, { createContext, useContext, useReducer, Dispatch } from "react";
import { mustache } from "../utils";
import { $initialLayout } from "../constants";

// --- Types ---

type ViewContexts = "explorer" | "dependencies" | "none";
interface iModalAction {
  label: string;
  callback: () => void;
  style?: ModalButtonStyles;
}
interface iModalDataTemplate {
  message: string;
  description: string;
  actions: iModalAction[];
}

interface iState {
  // Flag of display or hide Pane section
  // openExplorer: boolean;
  // Enable or disable pointer events on iframe[title="preview"]
  pointerEventsOnPreviewIframe: boolean;
  currentContext: ViewContexts;
  // Switch status of displaying Preview
  isPreviewDisplay: boolean;
  // Switch status of displaying Sidebar
  isSidebarDisplay: boolean;
  // width of div.editor-section
  editorWidth: number;
  // width of div.pane. This will 0 when pane is close
  paneWidth: number;
  // width of div.pane when it will close
  paneWidthOnClose: number;
  // width of div.preview-section when it will close
  previewWidthOnClose: number;
  // Show modal if true
  showModal: boolean;
  // This data will be passed to modal dialog
  modalDataSet: iModalDataTemplate;
}

enum Types {
  DisablePointerEventsOnIframe = "DISABLE_POINTER_EVENTS_ON_IFRAME",
  EnablePointerEventsOnIframe = "ENABLE_POINTER_EVENTS_ON_IFRAME",
  ChangeContext = "CHANGE_CONTEXT",
  TogglePreview = "TOGGLE_PREVIEW",
  UpdateEditorWidth = "UPDATE_EDITOR_WIDTH",
  UpdatePaneWidth = "UPDATE_PANE_WIDTH",
  ToggleSidebar = "TOGGLE_SIDEBAR",
  ShowModal = "SHOW_MODAL",
  RemoveModal = "REMOVE_MODAL",
}

enum ModalTypes {
  DeleteAFile = "delete-a-file",
  DeleteAFolder = "delete-a-folder",
}

enum ModalButtonStyles {
  Danger = "danger",
  Normal = "normal",
  Transparent = "transparent",
}

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

type iLayoutActionPayload = {
  [Types.DisablePointerEventsOnIframe]: {};
  [Types.EnablePointerEventsOnIframe]: {};
  [Types.ChangeContext]: {
    context: ViewContexts;
  };
  [Types.TogglePreview]: {};
  [Types.UpdateEditorWidth]: {
    width: number;
  };
  [Types.UpdatePaneWidth]: {
    width: number;
  };
  [Types.ToggleSidebar]: {};
  [Types.ShowModal]: {
    modalType: ModalTypes;
    callback: () => void;
    fileName?: string;
  };
  [Types.RemoveModal]: {};
};

type iLayoutActions =
  ActionMap<iLayoutActionPayload>[keyof ActionMap<iLayoutActionPayload>];

// --- Definitions ---

const getWindowWidth = () => {
  return window.innerWidth;
};

const modalDataTemplate: Record<ModalTypes, Readonly<iModalDataTemplate>> = {
  "delete-a-file": {
    message: "Are you sure you want to delete this file?",
    description: "The file '{{FILENAME}}' will be removed permanently.",
    actions: [],
  },
  "delete-a-folder": {
    message: "Are you sure you want to delete this file?",
    description:
      "The folder '{{FOLDERNAME}}' and descendants will be removed permanently.",
    actions: [],
  },
};

const getModalDataSet = (
  modalType: ModalTypes,
  callback: () => void,
  fileName?: string
): iModalDataTemplate => {
  switch (modalType) {
    case ModalTypes.DeleteAFile: {
      const template = modalDataTemplate[modalType];
      const actions = [
        ...template.actions,
        {
          label: "Delete",
          callback: callback,
          style: ModalButtonStyles.Danger,
        },
      ];

      let description = template.description;
      if (fileName !== undefined) {
        description = mustache(template.description, { FILENAME: fileName });
      }

      return {
        message: template.message,
        description: description,
        actions: actions,
      };
    }
    case ModalTypes.DeleteAFolder: {
      const template = modalDataTemplate[modalType];
      const actions = [
        ...template.actions,
        {
          label: "Delete",
          callback: callback,
          style: ModalButtonStyles.Danger,
        },
      ];

      let description = template.description;
      if (fileName !== undefined) {
        description = mustache(template.description, { FOLDERNAME: fileName });
      }

      return {
        message: template.message,
        description: description,
        actions: actions,
      };
    }
  }
};

const LayoutContext = createContext<iState>({
  pointerEventsOnPreviewIframe: true,
  currentContext: "explorer",
  isPreviewDisplay: true,
  isSidebarDisplay: true,
  editorWidth: $initialLayout.editorLayout.defaultWidth,
  paneWidth: $initialLayout.paneLayout.defaultWidth,
  paneWidthOnClose: $initialLayout.paneLayout.defaultWidth,
  previewWidthOnClose:
    getWindowWidth() -
    $initialLayout.editorLayout.defaultWidth -
    $initialLayout.paneLayout.defaultWidth,
  showModal: false,
  modalDataSet: {
    message: "",
    description: "",
    actions: [],
  },
});

const LayoutDispatchContext = createContext<Dispatch<iLayoutActions>>(
  () => null
);

function layoutReducer(state: iState, action: iLayoutActions) {
  switch (action.type) {
    case Types.DisablePointerEventsOnIframe: {
      return {
        ...state,
        pointerEventsOnPreviewIframe: false,
      };
    }
    case Types.EnablePointerEventsOnIframe: {
      return {
        ...state,
        pointerEventsOnPreviewIframe: true,
      };
    }
    /***
     *
     * */
    case Types.ChangeContext: {
      const { context } = action.payload;
      // On close pane:
      if (context === state.currentContext) {
        const _paneWidth = state.paneWidth;
        // Expand editorWidth to fit screen excluding Navigation if preview is closing.
        if (!state.isPreviewDisplay) {
          return {
            ...state,
            currentContext: "none",
            paneWidthOnClose: _paneWidth,
            paneWidth: 0,
            editorWidth: getWindowWidth(),
          };
        }
        // Share pane width with editorWidth and preview width if preview is not closing.
        else {
          return {
            ...state,
            currentContext: "none",
            paneWidthOnClose: _paneWidth,
            paneWidth: 0,
          };
        }
      }
      // On open pane or just change context:
      if (state.currentContext === "none") {
        // In case preview is closing:
        // pane occupies width with state.paneWidthOnClose, Navigation is navigationWidth, editorWidth is rest when preview is closing.
        if (!state.isPreviewDisplay) {
          return {
            ...state,
            currentContext: context,
            paneWidth: state.paneWidthOnClose,
            editorWidth: getWindowWidth() - state.paneWidthOnClose,
          };
        }
        // In case preview is opening:
        else {
          let _editorWidth = state.editorWidth;
          // In order not to let editorWidth over its maximumWidth limit.
          if (_editorWidth > $initialLayout.editorLayout.maximumWidth) {
            _editorWidth = $initialLayout.editorLayout.maximumWidth;
          }
          return {
            ...state,
            currentContext: context,
            paneWidth: state.paneWidthOnClose,
            editorWidth: _editorWidth,
          };
        }
      }
      // Just change context except "none"
      return {
        ...state,
        currentContext: context,
      };
    }
    /***
     *
     * */
    case Types.TogglePreview: {
      // on close preview:
      if (state.isPreviewDisplay) {
        const _previewWidthOnClose =
          getWindowWidth() - state.paneWidth - state.editorWidth;
        if (state.currentContext === "none") {
          // In case pane is closing
          // Editor expand to fill screen excluding navigation.
          return {
            ...state,
            isPreviewDisplay: false,
            previewWidthOnClose: _previewWidthOnClose,
            editorWidth: getWindowWidth(),
          };
        } else {
          // In case pane is opening
          // Editor expand to fill part of preview-section.
          return {
            ...state,
            isPreviewDisplay: false,
            previewWidthOnClose: _previewWidthOnClose,
            editorWidth: getWindowWidth() - state.paneWidth,
          };
        }
      }
      // On open preview:
      else {
        if (state.currentContext === "none") {
          // In case pane is closing
          // EditorSection width shrink to length of the preview and navigation removed.
          const _editorWidth = getWindowWidth() - state.previewWidthOnClose;
          return {
            ...state,
            isPreviewDisplay: true,
            editorWidth: _editorWidth,
          };
        } else {
          // In case pane is opening.
          // EditorSection width shrink to length of the preview and pane, navigation removed.
          let _editorWidth =
            getWindowWidth() - state.paneWidth - state.previewWidthOnClose;
          // In order not to let editor width be less tan its minimum size.
          if (_editorWidth < $initialLayout.editorLayout.minimumWidth) {
            _editorWidth = $initialLayout.editorLayout.minimumWidth;
          }
          return {
            ...state,
            isPreviewDisplay: true,
            editorWidth: _editorWidth,
          };
        }
      }
    }
    case Types.ToggleSidebar: {
      // On close sidebar:
      if (state.isSidebarDisplay) {
        const _paneWidth = state.paneWidth;
        // Expand editorWidth to fit screen excluding Navigation if preview is closing.
        if (!state.isPreviewDisplay) {
          return {
            ...state,
            paneWidthOnClose: _paneWidth,
            paneWidth: 0,
            editorWidth: getWindowWidth(),
            isSidebarDisplay: false,
          };
        }
        // Share pane width with editorWidth and preview width if preview is not closing.
        else {
          return {
            ...state,
            paneWidthOnClose: _paneWidth,
            paneWidth: 0,
            isSidebarDisplay: false,
          };
        }
      }
      // On open sidebar
      else {
        // In case preview is closing:
        // pane occupies width with state.paneWidthOnClose, Navigation is navigationWidth, editorWidth is rest when preview is closing.
        if (!state.isPreviewDisplay) {
          return {
            ...state,
            paneWidth: state.paneWidthOnClose,
            editorWidth: getWindowWidth() - state.paneWidthOnClose,
            isSidebarDisplay: true,
          };
        }
        // In case preview is opening:
        else {
          let _editorWidth = state.editorWidth;
          // In order not to let editorWidth over its maximumWidth limit.
          if (_editorWidth > $initialLayout.editorLayout.maximumWidth) {
            _editorWidth = $initialLayout.editorLayout.maximumWidth;
          }
          return {
            ...state,
            paneWidth: state.paneWidthOnClose,
            editorWidth: _editorWidth,
            isSidebarDisplay: true,
          };
        }
      }
    }
    /****
     *
     ***/
    case Types.UpdateEditorWidth: {
      const { width } = action.payload;
      return {
        ...state,
        editorWidth: width,
      };
    }
    case Types.UpdatePaneWidth: {
      const { width } = action.payload;
      // Fit editor-section width fill width except navigation in case preview is closing
      let _editorWidth = state.editorWidth;
      if (!state.isPreviewDisplay) {
        _editorWidth = getWindowWidth() - width;
      }
      return {
        ...state,
        paneWidth: width,
        editorWidth: _editorWidth,
      };
    }
    case Types.ShowModal: {
      const { modalType, callback, fileName } = action.payload;

      return {
        ...state,
        showModal: true,
        modalDataSet: getModalDataSet(modalType, callback, fileName),
      };
    }
    case Types.RemoveModal: {
      // set showModal to false and remove modalDataSet.
      return {
        ...state,
        showModal: false,
        modalDataSet: {
          message: "",
          description: "",
          actions: [],
        },
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

const initialState: iState = {
  pointerEventsOnPreviewIframe: true,
  currentContext: "explorer",
  isPreviewDisplay: true,
  isSidebarDisplay: true,
  editorWidth: $initialLayout.editorLayout.defaultWidth,
  paneWidth: $initialLayout.paneLayout.defaultWidth,
  paneWidthOnClose: $initialLayout.paneLayout.defaultWidth,
  previewWidthOnClose:
    getWindowWidth() -
    $initialLayout.editorLayout.defaultWidth -
    $initialLayout.paneLayout.defaultWidth,
  showModal: false,
  modalDataSet: {
    message: "",
    description: "",
    actions: [],
  },
};

// https://stackoverflow.com/a/57253387/22007575
const LayoutStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [layoutState, dispatch] = useReducer(layoutReducer, initialState);

  //   DEBUG:
  // console.log("[LayoutContext] rendering...");
  // console.log(`[LayoutContext] showModal: ${layoutState.showModal}`);
  // console.log(`[LayoutContext] modalDataSet: ${layoutState.modalDataSet}`);
  // console.log(`[LayoutContext] window.innerWidt: ${window.innerWidth}`);
  // console.log(`[LayoutContext] paneWidth: ${layoutState.paneWidth}`);
  // console.log(`[LayoutContext] editorWidth: ${layoutState.editorWidth}`);
  // console.log(
  //   `[LayoutContext] previewWidthOnClose: ${layoutState.previewWidthOnClose}`
  // );
  // const sumOfPaneAndEditor = layoutState.paneWidth + layoutState.editorWidth;
  // console.log(`[LayoutContext] total width: ${sumOfPaneAndEditor}`);
  // console.log(
  //   `[LayoutContext] total width: ${window.innerWidth - sumOfPaneAndEditor}`
  // );

  return (
    <LayoutContext.Provider value={layoutState}>
      <LayoutDispatchContext.Provider value={dispatch}>
        {children}
      </LayoutDispatchContext.Provider>
    </LayoutContext.Provider>
  );
};

// --- Hooks ---

function useLayoutState() {
  return useContext(LayoutContext);
}

function useLayoutDispatch() {
  return useContext(LayoutDispatchContext);
}

export {
  useLayoutState,
  useLayoutDispatch,
  LayoutStateProvider,
  // types
  ViewContexts,
  iLayoutActions,
  iModalAction,
  // enums
  ModalTypes,
  Types,
  ModalButtonStyles,
};
