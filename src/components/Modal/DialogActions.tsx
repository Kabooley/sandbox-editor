import React from 'react';
import { iModalAction } from '../../slices/layoutSlice';
import { DeleteFileAction } from './DeleteFileAction';
import { layoutActions } from '../../slices/layoutSlice';
import { useAppDispatch } from '../../store/hooks';

// interface iProps extends iModalAction {}
interface iProps {
    key: number;
    action: iModalAction;
}

/***
 * Divide actions according to props `action.requiredAction.type`.
 *
 * */
const DialogActions = (props: iProps) => {
    const { requiredAction } = props.action;
    const dispatch = useAppDispatch();

    const handleClickOnDefault = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        dispatch(layoutActions.RemoveModal());
    };

    if (requiredAction.type) {
        return <DeleteFileAction {...props.action} />;
    } else {
        return (
            <button className="action" onClick={handleClickOnDefault}>
                {'OK'}
            </button>
        );
    }
};

export default DialogActions;
