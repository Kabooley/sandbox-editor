import React from 'react';
import { createPortal } from 'react-dom';
import Dialog from './Dialog';
import Overlay from './Overlay';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
    selectLayoutState,
    layoutSlice,
    layoutActions,
} from '../../slices/layoutSlice';

const Modal = () => {
    const { showModal, modalDataSet } = useAppSelector(selectLayoutState);
    const dispatch = useAppDispatch();
    const { message, description, actions } = modalDataSet;

    // 問答無用でキャンセル扱いになります
    const handleCloseModal = () => {
        dispatch(layoutActions.RemoveModal());
    };

    // const parent = parentNode ? parentNode : document.body;
    const parent = document.body;

    console.log(`[Modal] rendering. ${showModal ? 'show' : 'hide'}`);

    if (showModal) {
        return (
            <>
                {showModal &&
                    createPortal(
                        <Overlay handleClick={() => {}}>
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
