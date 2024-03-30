/*******************************************************************
 * FormColumn for Workspace column.
 *
 * *****************************************************************/
import React from 'react';
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
    isSameNameAlreadyExists: boolean;
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
    isSameNameAlreadyExists,
    inputStyle,
    handleNewItemNameInput,
    callbackOnKeyDown,
    setIsInputBegun,
    displayForm,
}) => {
    /***
     * Undisplay this form if form has been blurred.
     *
     * */
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.stopPropagation();
        setIsInputBegun(false);
        displayForm(false);
    };

    /**
     *
     * */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (e.keyCode === 13 && isNameValid && !isNameEmpty) {
            callbackOnKeyDown(e.currentTarget.value);
        }
    };

    return (
        <div className="stack-body-list__item inputContainer" key={id}>
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
                isSameNameAlreadyExists={isSameNameAlreadyExists}
                marginLeft={`calc(${columnIndent} + 20px)`}
                width={`calc(100% - ${columnIndent} - 20px)`}
            />
        </div>
    );
};

export default FormColumn;
