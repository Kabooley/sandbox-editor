import React from 'react';
import { filesActions } from '../../slices/filesSlice';
import { useAppDispatch } from '../../store/hooks';

interface iProps {
    label: string | undefined;
    deletionFiles: string[];
}

export const DeleteFileButton = ({ label, deletionFiles }: iProps) => {
    const dispatch = useAppDispatch();

    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        if (deletionFiles.length > 1) {
            dispatch(
                filesActions.deleteMultipleFiles({
                    requiredPaths: deletionFiles,
                })
            );
        } else if (deletionFiles.length === 1) {
            dispatch(
                filesActions.deleteFile({ requiredPath: deletionFiles[0] })
            );
        }
    };
    //   const className = ["action", style].join(" ");

    return (
        <button className="action danger" onClick={onClick}>
            {label}
        </button>
    );
};
