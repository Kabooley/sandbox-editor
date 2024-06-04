import React from 'react';
import DialogActions from './DialogActions';
import closeButton from '../../assets/vscode/dark/close.svg';
import { CancelAction } from './CancelAction';
import type { iModalAction } from '../../slices/layoutSlice';

interface iProps {
    closeHandler: () => void;
    actions: iModalAction[];
    dialogMessage: string;
    dialogDescription: string;
}

const Dialog = ({
    closeHandler,
    actions,
    dialogMessage,
    dialogDescription,
}: iProps) => {
    const onClose = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        closeHandler();
    };

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
                {' '}
                <div className="dialog-message">{dialogMessage}</div>
                <div className="dialog-description">
                    <span>{dialogDescription}</span>
                </div>
            </div>
            <div className="dialog__actions">
                {actions.map((action, index) => (
                    <DialogActions key={index} action={action} />
                ))}
                <CancelAction />
            </div>
        </div>
    );
};

export default Dialog;
