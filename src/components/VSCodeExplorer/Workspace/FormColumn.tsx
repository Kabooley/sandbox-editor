/*******************************************************************
 * FormColumn for Workspace column.
 *
 * *****************************************************************/
import React, { useState, useEffect } from 'react';
import ValidMessage from '../ValidMessage';
import chevronRightIcon from '../../../assets/vscode/dark/chevron-right.svg';

interface iProps {
    id: string;
    columnIndent: string;
    isFolder: boolean;
    name: string;
    isNameEmpty: boolean;
    isInputBegun: boolean;
    isNameValid: boolean;
    inputStyle: React.CSSProperties;
    handleNewItemNameInput: (
        e: React.ChangeEvent<HTMLInputElement>,
        isFolder: boolean
    ) => void;
    callbackOnKeyDown: (targetValue: string) => void;
    setIsInputBegun: (flag: boolean) => void;
    displayForm: (flag: boolean) => void;
}

const FormColumn: React.FC<iProps> = ({
    id,
    columnIndent,
    isFolder,
    name,
    isNameEmpty,
    isInputBegun,
    isNameValid,
    inputStyle,
    handleNewItemNameInput,
    callbackOnKeyDown,
    setIsInputBegun,
    displayForm,
}) => {
    // フォーカスが外れたらこのフォーム要素を閉じさせる
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        console.log('[FormColumn] on blur');

        e.stopPropagation();
        setIsInputBegun(false);
        displayForm(false);
    };

    /**
     *
     *
     * */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();
        // e.preventDefault();

        if (e.keyCode === 13 && isNameValid && !isNameEmpty) {
            console.log(`[FormColumn] key down`);

            callbackOnKeyDown(e.currentTarget.value);
        }
    };

    console.log('[FormColumn] rendering...');

    return (
        <div
            className="stack-body-list__item inputContainer"
            key={id}
            // onClick={handleClickFolderColumn}
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
                // onKeyDown={(e) => onAddItem(e, path)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onChange={(e) => handleNewItemNameInput(e, isFolder)}
                autoFocus
                placeholder={name}
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

export default FormColumn;
