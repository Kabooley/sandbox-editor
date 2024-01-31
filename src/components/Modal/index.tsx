import React from "react";
import { createPortal } from "react-dom";
import { Types as ActionTypesOfLayoutContext } from "../../context/LayoutContext";
import { useLayoutDispatch, useLayoutState } from "../../context/LayoutContext";
import Dialog from "./Dialog";
import Overlay from "./Overlay";

interface iProps {}

const Modal: React.FC<iProps> = () => {
  const { showModal, modalDataSet } = useLayoutState();
  const { message, description, actions } = modalDataSet;
  const dispatchLayoutAction = useLayoutDispatch();

  // 問答無用でキャンセル扱いになります
  const handleCloseModal = () => {
    console.log("[Modal] handleCloseModal");

    dispatchLayoutAction({
      type: ActionTypesOfLayoutContext.RemoveModal,
      payload: {},
    });
  };

  // const parent = parentNode ? parentNode : document.body;
  const parent = document.body;

  console.log(`[Modal] rendering. ${showModal ? "show" : "hide"}`);

  if (showModal) {
    return (
      <>
        {showModal &&
          createPortal(
            <Overlay>
              <Dialog
                closeHandler={handleCloseModal}
                actions={actions}
                dialogMessage={message}
                dialogDescription={description}
              />
            </Overlay>,
            parent
          )}
      </>
    );
  } else {
    return null;
  }
};

export default Modal;
