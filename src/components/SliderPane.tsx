import React from 'react'
import { useWindowSize } from '../hooks'
import SidebarTitle from './VSCodeExplorer/SidebarTitle'
import {
  $heightOfPaneTitle,
  $heightOfHeader,
  $heightOfFooter,
} from '../constants'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import SkeletonExplorer from './Skeletons/SkeletonExplorer'
import { selectLayoutState, layoutActions } from '../slices/layoutSlice'
import menu from '../assets/menu.svg'

const VSCodeExplorer = React.lazy(() =>
  import('./VSCodeExplorer/VSCodeExplorer')
)

/***
 * Toggleable Slider Pane
 *
 * Pane.tsxと比較して
 * - リサイズ不可
 * - width固定
 * - heightはheader分を含む
 * - `isSliderPaneDisplay: true`である場合overlayがpane以外の領域に表示される
 * - Overlay領域をクリックするとPanは閉じる
 * */
const SliderPane = () => {
  const { isSliderPaneDisplay } = useAppSelector(selectLayoutState)
  const dispatch = useAppDispatch()
  const { innerHeight } = useWindowSize()
  // paneHeight is not same as when it is Pane.tsx. This paneHeight is including header height.
  const paneHeight = innerHeight - $heightOfFooter
  // So width also not as well. width is fixed as 300px.
  const paneWidth = 300
  const className = isSliderPaneDisplay
    ? 'slider-pane__container'
    : 'slider-pane__container slide-in'

  return (
    <div className={className} style={{ height: `${paneHeight}px` }}>
      <nav>
        <div className="nav--item">
          <button onClick={() => dispatch(layoutActions.ToggleSliderPane())}>
            <img src={menu} />
          </button>
        </div>
      </nav>
      <SidebarTitle width={paneWidth} title={'explorer'} />
      <React.Suspense
        fallback={
          <SkeletonExplorer
            width={paneWidth}
            height={paneHeight - $heightOfPaneTitle}
          />
        }
      >
        <VSCodeExplorer
          width={paneWidth}
          height={paneHeight - $heightOfPaneTitle - $heightOfHeader}
        />
      </React.Suspense>
      {isSliderPaneDisplay && (
        <div
          className="temporary-overlay"
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: '-100',
          }}
          onClick={() => dispatch(layoutActions.ToggleSliderPane())}
        ></div>
      )}
    </div>
  )
}

export default SliderPane
