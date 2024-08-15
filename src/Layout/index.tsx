import React from 'react'
import { useMedia } from 'react-use'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import PhoneMediaLayout from './phone'
import TabletMediaLayout from './tablet'
import DesktopMediaLayout from './desktop'
import {
  selectLayoutState,
  layoutActions,
  MediaTypes,
} from '../slices/layoutSlice'
import { useWindowSize } from '../hooks/useWindowSize'

const Layout = () => {
  const { mediaType } = useAppSelector(selectLayoutState)
  const { innerWidth } = useWindowSize()
  const isMediaPhone = useMedia('(max-width:660px)')
  const isMediaTabletMin = useMedia('(min-width:660px)')
  const isMediaTabletMax = useMedia('(max-width:1279px)')
  const isMediaDesktop = useMedia('(min-width:1280px)')
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    dispatch(layoutActions.UpdateWindowWidth())
  }, [innerWidth])

  React.useEffect(() => {
    if (isMediaPhone && !isMediaTabletMin) {
      dispatch(layoutActions.ChangeMedia(MediaTypes.Phone))
    } else if (isMediaTabletMin && isMediaTabletMax) {
      dispatch(layoutActions.ChangeMedia(MediaTypes.Tablet))
    } else if (isMediaDesktop) {
      dispatch(layoutActions.ChangeMedia(MediaTypes.Desktop))
    }
  }, [isMediaPhone, isMediaTabletMin, isMediaTabletMax, isMediaDesktop])

  if (mediaType === MediaTypes.Desktop) {
    return <DesktopMediaLayout />
  } else if (mediaType === MediaTypes.Phone) {
    return <PhoneMediaLayout />
  } else {
    return <TabletMediaLayout />
  }
}

export default Layout

// const Layout = () => {
//   const {
//     mediaType,
//     // DEBUG: 以下のstateはデバグ目的で呼び出したもの
//     mediaDesktopEditorWidth,
//     mediaDesktopPaneWidthOnClose,
//     mediaDesktopPaneWidth,
//     mediaDesktopPreviewWidthOnClose,
//     isPreviewDisplay,
//     isSidebarDisplay,
//     mediaTabletEditorWidth,
//     isSliderPaneDisplay,
//     mediaTabletPreviewWidthOnClose,
//     isTabletPreviewDisplay,
//     isPhonePreviewDisplay,
//   } = useAppSelector(selectLayoutState)

//   // DEBUG:
//   const { innerWidth } = useWindowSize()
//   // DEBUG:
//   React.useEffect(() => {
//     dispatch(layoutActions.UpdateWindowWidth())
//   }, [innerWidth])

//   const isMediaPhone = useMedia('(max-width:660px)')
//   const isMediaTabletMin = useMedia('(min-width:660px)')
//   const isMediaTabletMax = useMedia('(max-width:1279px)')
//   const isMediaDesktop = useMedia('(min-width:1280px)')
//   const dispatch = useAppDispatch()

//   React.useEffect(() => {
//     if (isMediaPhone && !isMediaTabletMin) {
//       // media is phone
//       console.log('[MainContainer] media is Phone')
//       dispatch(layoutActions.ChangeMedia(MediaTypes.Phone))
//     } else if (isMediaTabletMin && isMediaTabletMax) {
//       // media is tablet
//       console.log('[MainContainer] media is Tablet')
//       dispatch(layoutActions.ChangeMedia(MediaTypes.Tablet))
//     } else if (isMediaDesktop) {
//       // Now that media is desktop
//       console.log('[MainContainer] media is Desktop')
//       dispatch(layoutActions.ChangeMedia(MediaTypes.Desktop))
//     }
//   }, [isMediaPhone, isMediaTabletMin, isMediaTabletMax, isMediaDesktop])

//   // DEBUG
//   const debugLayoutState = () => {
//     return (
//       <div
//         style={{
//           position: 'fixed',
//           bottom: '16px',
//           left: '24px',
//           padding: '16px',
//           backgroundColor: 'white',
//           color: 'black',
//           zIndex: '3000',
//         }}
//       >
//         <ul
//           style={{
//             display: 'flex',
//             flexDirection: 'column',
//             listStyle: 'none',
//           }}
//         >
//           <li>
//             <span>-- Media: {mediaType} --</span>
//           </li>
//           <li>
//             <span>-- desktop media --</span>
//           </li>
//           <li>
//             <span>desktop editor width: {mediaDesktopEditorWidth}</span>
//           </li>
//           <li>
//             <span>desktop pane width: {mediaDesktopPaneWidth}</span>
//           </li>
//           <li>
//             <span>
//               desktop pane width on close: {mediaDesktopPaneWidthOnClose}
//             </span>
//           </li>
//           <li>
//             <span>
//               desktop Preview width on close: {mediaDesktopPreviewWidthOnClose}
//             </span>
//           </li>
//           <li>
//             <span>isPreviewDisplay: {'' + isPreviewDisplay}</span>
//           </li>
//           <li>
//             <span>isSidebarDisplay: {'' + isSidebarDisplay}</span>
//           </li>
//           <li>
//             <span>-- tablet media --</span>
//           </li>
//           <li>
//             <span>tablet editor width: {mediaTabletEditorWidth}</span>
//           </li>
//           <li>
//             <span>
//               tablet Preview width on close: {mediaTabletPreviewWidthOnClose}
//             </span>
//           </li>
//           <li>
//             <span>isTabletPreviewDisplay: {'' + isTabletPreviewDisplay}</span>
//           </li>
//           <li>
//             <span>-- phone media --</span>
//           </li>
//           <li>
//             <span>is Phone preview display: {'' + isPhonePreviewDisplay}</span>
//           </li>

//           <li>
//             <span>-- common media --</span>
//           </li>
//           <li>
//             <span>isSliderPaneDisplay: {'' + isSliderPaneDisplay}</span>
//           </li>
//         </ul>
//       </div>
//     )
//   }

//   if (mediaType === MediaTypes.Desktop) {
//     return (
//       <>
//         {debugLayoutState()}
//         <DesktopMediaLayout />
//       </>
//     )
//   } else if (mediaType === MediaTypes.Phone) {
//     return (
//       <>
//         {debugLayoutState()}
//         <PhoneMediaLayout />
//       </>
//     )
//   } else {
//     return (
//       <>
//         {debugLayoutState()}
//         <TabletMediaLayout />
//       </>
//     )
//   }
// }

// export default Layout
