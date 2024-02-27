import React from "react";
import { iModalAction } from "../../context/LayoutContext";
import DialogAction from "./DialogAction";

import closeButton from "../../assets/vscode/dark/close.svg";

interface iProps {
  closeHandler: () => void;
  actions: iModalAction[];
  dialogMessage: string;
  dialogDescription: string;
}

const Dialog: React.FC<iProps> = ({
  closeHandler,
  actions,
  dialogMessage,
  dialogDescription,
}) => {
  const onClose = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    closeHandler();
  };

  console.log("[Dialog] rendering...");

  return (
    <div className="modal-content">
      <div className="dialog__upper">
        <div onClick={onClose}>
          <img
            className="codicon"
            src={closeButton}
            alt="close dialog button"
          />
        </div>
      </div>
      <div className="dialog__rower">
        {" "}
        <div className="dialog-message">{dialogMessage}</div>
        <div className="dialog-description">
          <span>{dialogDescription}</span>
        </div>
      </div>
      <div className="dialog__actions">
        {actions.map((action, index) => (
          <DialogAction key={index} {...action} />
        ))}
        <DialogAction
          key={999}
          label="Cancel"
          callback={closeHandler}
          style={"transparent"}
        />
      </div>
    </div>
  );
};

export default Dialog;
