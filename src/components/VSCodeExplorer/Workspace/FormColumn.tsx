import React, { useState, useEffect } from 'react';
import ValidMessage from '../ValidMessage';
import chevronRightIcon from '../../../assets/vscode/dark/chevron-right.svg';

interface iProps {
    id: number;
    columnIndent: number;
    isFolder: boolean;
    path: string;
    handleNewItemNameInput: (
        e: React.ChangeEvent<HTMLInputElement>,
        isFolder: boolean
    ) => void;
    onAddItem: (
        e: React.KeyboardEvent<HTMLInputElement>,
        addTo: string
    ) => void;
}

const FormColumn: React.FC<iProps> = ({
    id,
    columnIndent,
    isFolder,
    path,
    handleNewItemNameInput,
    onAddItem,
}) => {
    const [isInputBegun, setIsInputBegun] = useState<boolean>(false);
    const [isNameValid, setIsNameValid] = useState<boolean>(false);
    const [isNameEmpty, setIsNameEmpty] = useState<boolean>(false);
    return (
        <div
            className="stack-body-list__item inputContainer"
            key={id}
            onClick={handleClickFolderColumn}
        >
            <div className="indent" style={{ paddingLeft: columnIndent }}></div>
            <div className="codicon">
                {isFolder ? (
                    <img src={chevronRightIcon} alt="folder icon" />
                ) : (
                    <img src={chevronRightIcon} alt="file icon" />
                )}
            </div>
            <input
                type="text"
                className={
                    'inputContainer--input' +
                    ' ' +
                    (isNameValid ? '__valid' : '__invalid')
                }
                onKeyDown={(e) => onAddItem(e, path)}
                onBlur={() => {
                    setIsInputBegun(false);
                    setShowInput({
                        ...showInput,
                        visible: false,
                    });
                }}
                onChange={(e) => handleNewItemNameInput(e, isFolder)}
                autoFocus
                placeholder={
                    isFolder ? defaultNewDirectoryName : defaultNewFileName
                }
                style={inputStyle}
            />
            {/* margin-left: indent + codicon */}
            <ValidMessage
                isNameEmpty={isNameEmpty}
                isInputBegun={isInputBegun}
                isNameValid={isNameValid}
                marginLeft={`calc(${columnIndent} + 20px)`}
                width={`calc(100% - ${columnIndent} - 20px)`}
            />
        </div>
    );
};
