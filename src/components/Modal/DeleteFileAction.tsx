import React from 'react';
import { filesActions } from '../../slices/filesSlice';
import { layoutActions, ModalTypes } from '../../slices/layoutSlice';
import { useAppDispatch } from '../../store/hooks';
import type { iModalAction } from '../../slices/layoutSlice';

interface iProps extends iModalAction {}

/***
 * Delete button for deletion file or folder from files.
 * NOTE: NOT only file, also folder.
 * */ 
export const DeleteFileAction = ({ label, requiredAction, style }: iProps) => {
    const dispatch = useAppDispatch();
    const { type } = requiredAction;

    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        if (type === ModalTypes.DeleteAFolder) {

            // DEBUG: 
            console.log(`[DeleteFileAction] delete ${requiredAction.payload.deletionFilesPath}`);

            dispatch(
                filesActions.deleteMultipleFiles({
                    requiredPaths: requiredAction.payload.deletionFilesPath,
                })
            );
        } else if (type === ModalTypes.DeleteAFile) {
            
            // DEBUG: 
            console.log(`[DeleteFileAction] delete ${requiredAction.payload.deletionFilePath}`);

            dispatch(
                filesActions.deleteFile({
                    requiredPath: requiredAction.payload.deletionFilePath,
                })
            );
        }
        dispatch(layoutActions.RemoveModal());
    };

    return (
        <button className="action danger" onClick={onClick}>
            {label}
        </button>
    );
};
