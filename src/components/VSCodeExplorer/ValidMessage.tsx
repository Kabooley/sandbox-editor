import React from 'react';

interface iProps {
    isInputBegun: boolean;
    isNameValid: boolean;
    isNameEmpty: boolean;
    marginLeft: string;
    width: string;
}

/**
 * Valid Message for input form of New item on Explorer.
 *
 * Appearence:
 *    - Display nothing if `isInputBegun` is false.
 *    - Display nothing if `isInputBegun` and `isNameValid` are true.
 *    - Display if `isInputBegun` is false.
 *
 * */
const ValidMessage = ({
    isInputBegun,
    isNameValid,
    isNameEmpty,
    marginLeft,
    width,
}: iProps) => {
    const _className =
        'inputContainer--validSign' +
        ' ' +
        (isNameValid ? '__valid' : '__invalid');

    const generateStyle = () => {
        if (!isInputBegun) {
            // 入力開始前
            return {
                display: 'none',
                marginLeft: marginLeft,
                width: width,
            };
        } else if (isInputBegun && isNameValid) {
            // 入力（フォーカス）中且つ入力内容に問題ない
            return { display: 'none', marginLeft: marginLeft, width: width };
        } else if (isInputBegun && !isNameValid) {
            // 入力（フォーカス）中且つ入力内容に問題あり
            return {
                display: 'block',
                marginLeft: marginLeft,
                width: width,
            };
        }
    };

    const generateMessage = () => {
        if (isInputBegun && isNameEmpty)
            return 'File or folder name must be provided.';
        if (isInputBegun && !isNameEmpty && !isNameValid)
            return 'File or folder name is invalid.';
        if (isInputBegun && isNameEmpty)
            return 'File or folder name must be provided.';
    };

    return (
        <div className={_className} style={generateStyle()}>
            <span>{generateMessage()}</span>
        </div>
    );
};

export default ValidMessage;
