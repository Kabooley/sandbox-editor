import React from "react";
import useKey from "react-use/lib/useKey";
import { Types as ActionTypesOfLayoutContext } from "../context/LayoutContext";
import { useLayoutDispatch } from "../context/LayoutContext";

interface iProps {
  children: any;
}

const KEYCODES_FOR_CHROME = {
  ctrl: 17,
  shift: 16,
  d: 68,
  b: 66,
};

const MainContainer: React.FC<iProps> = ({ children }) => {
  const dispatchLayoutAction = useLayoutDispatch();
  useKey(
    (e) => e.ctrlKey && e.keyCode === KEYCODES_FOR_CHROME.d && e.shiftKey,
    (e) => {
      e.preventDefault();
      // console.log("[MainContainer] ACTION: TOGGLE_PREVIEW");

      dispatchLayoutAction({
        type: ActionTypesOfLayoutContext.TogglePreview,
        payload: {},
      });
    }
  );
  useKey(
    (e) => e.ctrlKey && e.keyCode === KEYCODES_FOR_CHROME.b,
    (e) => {
      e.preventDefault();
      // console.log("[MainContainer] ACTION: TOGGLE_SIDEBAR");

      dispatchLayoutAction({
        type: ActionTypesOfLayoutContext.ToggleSidebar,
        payload: {},
      });
    }
  );

  return <div className="main-container">{children}</div>;
};

export default MainContainer;
