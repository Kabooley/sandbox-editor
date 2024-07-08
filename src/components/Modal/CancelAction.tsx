import React from 'react';
import { layoutActions } from '../../slices/layoutSlice';
import { useAppDispatch } from '../../store/hooks';

interface iProps {}

export const CancelAction = ({}: iProps) => {
    const dispatch = useAppDispatch();

    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        dispatch(layoutActions.RemoveModal());
    };

    return (
        <button className="action" onClick={onClick}>
            {'Cancel'}
        </button>
    );
};
