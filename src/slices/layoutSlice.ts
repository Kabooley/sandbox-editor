/***
 *　Decides state of app Layout.
 *
 * NOTE: レスポンシブレイアウト化に伴って、各media毎にstate管理することにした
 * TODOs:
 * 概ね良いので誤ったメソッドを別のコンポーネントで呼び出していないかなど確認
 * */
import React from 'react'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { mustache, limitWithinRange } from '../utils'
import { $initialLayout } from '../constants'
import { RootState } from '../store'

// --- Types ---

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key
      }
    : {
        type: Key
        payload: M[Key]
      }
}

enum ModalTypes {
  DeleteAFile = 'DELETE_A_FILE',
  DeleteAFolder = 'DELETE_A_FOLDER',
}

enum MediaTypes {
  Phone = 'PHONE',
  Tablet = 'TABLET',
  Desktop = 'DESKTOP',
}

/***
 * Determines dialog buttons style.
 * */
enum ModalButtonStyles {
  Danger = 'danger',
  Normal = 'normal',
  Transparent = 'transparent',
}

type iModalRequestedAction = {
  [ModalTypes.DeleteAFile]: {
    // deletion target
    deletionFilePath: string
    // used for description
    filename: string
  }
  [ModalTypes.DeleteAFolder]: {
    // deletion target
    deletionFilesPath: string[]
    // used for description
    filename: string
  }
}

type iModalActions =
  ActionMap<iModalRequestedAction>[keyof ActionMap<iModalRequestedAction>]

/****
 * Determines dialogs action button
 * */
interface iModalAction {
  label: string
  requiredAction: iModalActions
  style?: ModalButtonStyles
}

/***
 * Determines all contents in Dialog.
 * */
interface iModalDataTemplate {
  message: string
  description: string
  actions: iModalAction[]
}

interface iState {
  // --- @media common-media ---
  // Enable or disable pointer events on iframe[title="preview"]
  pointerEventsOnPreviewIframe: boolean
  // Show modal if true
  showModal: boolean
  // This data will be passed to modal dialog
  modalDataSet: iModalDataTemplate
  // media type
  mediaType: MediaTypes
  //
  windowWidth: number
  // --- @media desktop ---
  mediaDesktopEditorWidth: number
  mediaDesktopPaneWidth: number
  mediaDesktopPaneWidthOnClose: number
  mediaDesktopPreviewWidthOnClose: number
  // Switch status of displaying Preview
  isPreviewDisplay: boolean
  // Switch status of displaying Sidebar
  isSidebarDisplay: boolean
  // --- @media tablet ---
  mediaTabletEditorWidth: number
  mediaTabletPreviewWidthOnClose: number
  isTabletPreviewDisplay: boolean
  // --- @media tablet and phone ---
  isSliderPaneDisplay: boolean
  isPhonePreviewDisplay: boolean
}

const initialState: iState = {
  pointerEventsOnPreviewIframe: true,
  showModal: false,
  modalDataSet: {
    message: '',
    description: '',
    actions: [],
  },
  mediaType: MediaTypes.Desktop,
  windowWidth: window.innerWidth,

  // @media desktop
  mediaDesktopEditorWidth: $initialLayout.editorLayout.defaultWidth,
  mediaDesktopPaneWidth: $initialLayout.paneLayout.defaultWidth,
  mediaDesktopPaneWidthOnClose: $initialLayout.paneLayout.defaultWidth,
  mediaDesktopPreviewWidthOnClose:
    window.innerWidth -
    $initialLayout.editorLayout.defaultWidth -
    $initialLayout.paneLayout.defaultWidth,
  isPreviewDisplay: true,
  isSidebarDisplay: true,
  // @media tablet
  mediaTabletEditorWidth: Math.trunc(window.innerWidth * 0.6),
  mediaTabletPreviewWidthOnClose:
    window.innerWidth - Math.trunc(window.innerWidth * 0.6),
  isTabletPreviewDisplay: true,
  // @media phone
  isSliderPaneDisplay: true,
  isPhonePreviewDisplay: false,
}

const getWindowWidth = () => window.innerWidth

const modalDataTemplate: Record<ModalTypes, Readonly<iModalDataTemplate>> = {
  DELETE_A_FILE: {
    message: 'Are you sure you want to delete this file?',
    description: "The file '{{FILENAME}}' will be removed permanently.",
    actions: [],
  },
  DELETE_A_FOLDER: {
    message: 'Are you sure you want to delete this file?',
    description:
      "The folder '{{FOLDERNAME}}' and descendants will be removed permanently.",
    actions: [],
  },
}

// DEBUG: output example
// const deleteFileDialogTemplate: iModalDataTemplate = {
//     message: modalDataTemplate.DELETE_A_FILE.message,
//     description: mustache(
//         modalDataTemplate.DELETE_A_FILE.description,
//         { FILENAME: "getModalDataSet/parameter/filename" }
//     ),
//     actions: [
//         ...modalDataTemplate.DELETE_A_FILE.actions,
//         {
//             label: "Delete",
//             requiredAction: {
//                 type: ModalTypes.DeleteAFile,
//                 payload: {
//                     deletionFilePath: "getModalDataSet/parameter/filename",
//                     filename: "aaa"
//                 }
//             },
//             style: ModalButtonStyles.Danger
//         }
//     ]
// };
const getModalDataSet = ({
  type,
  payload,
}: iModalActions): iModalDataTemplate => {
  switch (type) {
    case ModalTypes.DeleteAFile: {
      const template = modalDataTemplate[type]
      const actions: iModalAction[] = [
        ...template.actions,
        {
          label: 'Delete',
          requiredAction: {
            type: type,
            payload: payload,
          },
          style: ModalButtonStyles.Danger,
        },
      ]
      const description = mustache(template.description, {
        FILENAME: payload.filename,
      })

      return {
        message: template.message,
        description: description,
        actions: actions,
      }
    }
    case ModalTypes.DeleteAFolder: {
      const template = modalDataTemplate[type]
      const actions: iModalAction[] = [
        ...template.actions,
        {
          label: 'Delete',
          requiredAction: {
            type: type,
            payload: payload,
          },
          style: ModalButtonStyles.Danger,
        },
      ]
      const description = mustache(template.description, {
        FOLDERNAME: payload.filename,
      })

      return {
        message: template.message,
        description: description,
        actions: actions,
      }
    }
  }
}

/****
 * */
export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    DisablePointerEventsOnIframe: (state) => {
      state.pointerEventsOnPreviewIframe = false
    },
    EnablePointerEventsOnIframe: (state) => {
      state.pointerEventsOnPreviewIframe = true
    },
    ShowModal: (state, action: PayloadAction<iModalActions>) => {
      state.showModal = true
      state.modalDataSet = getModalDataSet(action.payload)
    },
    RemoveModal: (state) => {
      state.showModal = false
      state.modalDataSet.message = ''
      state.modalDataSet.description = ''
      state.modalDataSet.actions = []
    },
    ChangeMedia: (state, action: PayloadAction<MediaTypes>) => {
      state.mediaType = action.payload
    },
    /**
     * DESKTOP MEDIA METHODS
     * */
    TogglePreview: (state) => {
      // on close preview:
      if (state.isPreviewDisplay) {
        const _previewWidthOnClose =
          getWindowWidth() -
          state.mediaDesktopPaneWidth -
          state.mediaDesktopEditorWidth
        if (!state.isSidebarDisplay) {
          // In case pane is closing
          // Editor expand to fill screen excluding navigation.
          state.isPreviewDisplay = false
          state.mediaDesktopPreviewWidthOnClose = _previewWidthOnClose
          state.mediaDesktopEditorWidth = getWindowWidth()
          return
        } else {
          // In case pane is opening
          // Editor expand to fill part of preview-section.
          state.isPreviewDisplay = false
          state.mediaDesktopPreviewWidthOnClose = _previewWidthOnClose
          state.mediaDesktopEditorWidth =
            getWindowWidth() - state.mediaDesktopPaneWidth
          return
        }
      }
      // On open preview:
      else {
        if (!state.isSidebarDisplay) {
          // In case pane is closing
          // EditorSection width shrink to length of the preview and navigation removed.
          state.isPreviewDisplay = true
          state.mediaDesktopEditorWidth =
            getWindowWidth() - state.mediaDesktopPreviewWidthOnClose
          return
        } else {
          // In case pane is opening.
          // EditorSection width shrink to length of the preview and pane, navigation removed.
          let _editorWidth =
            getWindowWidth() -
            state.mediaDesktopPaneWidth -
            state.mediaDesktopPreviewWidthOnClose
          // In order not to let editor width be less tan its minimum size.
          if (_editorWidth < $initialLayout.editorLayout.minimumWidth) {
            _editorWidth = $initialLayout.editorLayout.minimumWidth
          }
          state.isPreviewDisplay = true
          state.mediaDesktopEditorWidth = _editorWidth
          return
        }
      }
    },
    ToggleSidebar: (state) => {
      // On close sidebar:
      if (state.isSidebarDisplay) {
        const _paneWidth = state.mediaDesktopPaneWidth
        // Expand editorWidth to fit screen excluding Navigation if preview is closing.
        if (!state.isPreviewDisplay) {
          state.mediaDesktopPaneWidthOnClose = _paneWidth
          state.mediaDesktopPaneWidth = 0
          state.mediaDesktopEditorWidth = getWindowWidth()
          state.isSidebarDisplay = false
        }
        // Share pane width with editorWidth and preview width if preview is not closing.
        else {
          state.mediaDesktopPaneWidthOnClose = _paneWidth
          state.mediaDesktopPaneWidth = 0
          state.isSidebarDisplay = false
        }
      }
      // On open sidebar
      else {
        // In case preview is closing:
        // pane occupies width with state.mediaDesktopPaneWidthOnClose, Navigation is navigationWidth, editorWidth is rest when preview is closing.
        if (!state.isPreviewDisplay) {
          return {
            ...state,
            mediaDesktopPaneWidth: state.mediaDesktopPaneWidthOnClose,
            mediaDesktopEditorWidth:
              getWindowWidth() - state.mediaDesktopPaneWidthOnClose,
            isSidebarDisplay: true,
          }
        }
        // In case preview is opening:
        else {
          let _editorWidth = state.mediaDesktopEditorWidth
          // In order not to let editorWidth over its maximumWidth limit.
          if (
            _editorWidth >
            $initialLayout.editorLayout.maximumWidthRate * window.innerWidth
          ) {
            _editorWidth =
              $initialLayout.editorLayout.maximumWidthRate * window.innerWidth
          }
          return {
            ...state,
            mediaDesktopPaneWidth: state.mediaDesktopPaneWidthOnClose,
            mediaDesktopEditorWidth: _editorWidth,
            isSidebarDisplay: true,
          }
        }
      }
    },
    UpdatePaneWidth: (state, action: PayloadAction<number>) => {
      const width = action.payload
      // Fit editor-section width fill width except navigation in case preview is closing
      let _editorWidth = state.mediaDesktopEditorWidth
      if (!state.isPreviewDisplay) {
        _editorWidth = getWindowWidth() - width
      }
      state.mediaDesktopPaneWidth = width
      state.mediaDesktopEditorWidth = _editorWidth
    },
    /***
     * TABLET MEDIA METHODS
     * */
    ToggleTabletPreview: (state) => {
      if (state.mediaType !== MediaTypes.Tablet) {
        return
      }
      if (state.isTabletPreviewDisplay) {
        state.mediaTabletPreviewWidthOnClose =
          getWindowWidth() - state.mediaTabletEditorWidth
        state.mediaTabletEditorWidth = getWindowWidth()
        state.isTabletPreviewDisplay = false
      } else {
        state.mediaTabletEditorWidth =
          getWindowWidth() - state.mediaTabletPreviewWidthOnClose
        state.isTabletPreviewDisplay = true
      }
    },
    /***
     * PHONE MEDIA METHODS
     * */
    TogglePhonePreview: (state) => {
      state.isPhonePreviewDisplay = !state.isPhonePreviewDisplay
    },
    /***
     * COMMON MEDIA METHODS
     * */
    UpdateEditorWidth: (state, action: PayloadAction<number>) => {
      if (state.mediaType === MediaTypes.Tablet) {
        state.mediaTabletEditorWidth = action.payload
        return
      }
      state.mediaDesktopEditorWidth = action.payload
    },
    ToggleSliderPane: (state) => {
      state.isSliderPaneDisplay = !state.isSliderPaneDisplay
    },
    /***
     * Limitation on each resize
     *
     * tablet:
     * editor: window.innerWidth * 0.1 < editor width < window.innerWidth * 0.9
     * so as preview.
     *
     * desktop:
     * editor: 100px < editor width < window.innerWidth * 0.7
     * pane: 190px < pane width < window.innerWidth * 0.26
     *
     * */
    UpdateWindowWidth: (state) => {
      const windowWidth = window.innerWidth
      if (state.mediaType === MediaTypes.Tablet) {
        if (state.isTabletPreviewDisplay) {
          state.mediaTabletEditorWidth = limitWithinRange(
            Math.trunc(
              (state.mediaTabletEditorWidth / state.windowWidth) * windowWidth
            ),
            windowWidth * 0.1,
            windowWidth * 0.9
          )
        } else {
          state.mediaTabletEditorWidth = windowWidth
          state.mediaTabletPreviewWidthOnClose = limitWithinRange(
            Math.trunc(
              (state.mediaTabletPreviewWidthOnClose / state.windowWidth) *
                windowWidth
            ),
            windowWidth * 0.1,
            windowWidth * 0.9
          )
        }
      }
      /***
       *
       * */
      if (state.mediaType === MediaTypes.Desktop) {
        if (state.isPreviewDisplay && state.isSidebarDisplay) {
          state.mediaDesktopEditorWidth = limitWithinRange(
            Math.trunc(
              (state.mediaDesktopEditorWidth / state.windowWidth) * windowWidth
            ),
            $initialLayout.editorLayout.minimumWidth,
            $initialLayout.editorLayout.maximumWidthRate * window.innerWidth
          )
          state.mediaDesktopPaneWidth = limitWithinRange(
            Math.trunc(
              (state.mediaDesktopPaneWidth / state.windowWidth) * windowWidth
            ),
            $initialLayout.paneLayout.minimumWidth,
            $initialLayout.paneLayout.maximumWidthRate * windowWidth
          )
        } else if (!state.isPreviewDisplay && state.isSidebarDisplay) {
          state.mediaDesktopPaneWidth = limitWithinRange(
            Math.trunc(
              (state.mediaDesktopPaneWidth / state.windowWidth) * windowWidth
            ),
            $initialLayout.paneLayout.minimumWidth,
            $initialLayout.paneLayout.maximumWidthRate * windowWidth
          )
          state.mediaDesktopEditorWidth =
            window.innerWidth - state.mediaDesktopPaneWidth
        } else if (state.isPreviewDisplay && !state.isSidebarDisplay) {
          state.mediaDesktopEditorWidth = limitWithinRange(
            Math.trunc(
              (state.mediaDesktopEditorWidth / state.windowWidth) * windowWidth
            ),
            $initialLayout.editorLayout.minimumWidth,
            $initialLayout.editorLayout.maximumWidthRate * window.innerWidth
          )
          state.mediaDesktopPaneWidthOnClose = limitWithinRange(
            Math.trunc(
              (state.mediaDesktopPaneWidthOnClose / state.windowWidth) *
                windowWidth
            ),
            $initialLayout.paneLayout.minimumWidth,
            $initialLayout.paneLayout.maximumWidthRate * windowWidth
          )
        } else if (!state.isPreviewDisplay && !state.isSidebarDisplay) {
          state.mediaDesktopEditorWidth = window.innerWidth
          state.mediaDesktopPaneWidthOnClose = limitWithinRange(
            Math.trunc(
              (state.mediaDesktopPaneWidthOnClose / state.windowWidth) *
                windowWidth
            ),
            $initialLayout.paneLayout.minimumWidth,
            $initialLayout.paneLayout.maximumWidthRate * windowWidth
          )
          state.mediaDesktopPreviewWidthOnClose = limitWithinRange(
            getWindowWidth() -
              state.mediaDesktopPaneWidth -
              state.mediaDesktopEditorWidth,
            window.innerWidth * 0.1,
            window.innerWidth -
              $initialLayout.paneLayout.minimumWidth -
              $initialLayout.editorLayout.minimumWidth
          )
        }
      }
      state.windowWidth = windowWidth
    },
  },
})

export {
  // enums
  ModalTypes,
  ModalButtonStyles,
  MediaTypes,
  // types
  iModalAction,
}
export const layoutActions = layoutSlice.actions
export const selectLayoutState = (state: RootState) => state.layout
export default layoutSlice.reducer
