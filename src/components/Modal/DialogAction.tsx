import React from 'react';
import { iModalAction } from '../../slices/layoutSlice';

const DialogAction: React.FC<iModalAction> = ({
    label,
    callback,
    style = 'normal',
}) => {
    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();

        if (typeof callback === 'function') {
            callback();
        }
    };
    const className = ['action', style].join(' ');

    return (
        <button className={className} onClick={onClick}>
            {label}
        </button>
    );
};

export default DialogAction;
