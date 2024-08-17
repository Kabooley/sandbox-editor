/*******************************************************************************
 * Tree only for new item form.
 * This Tree will be provided if explorer id is '9999' as Tree for new item.
 *
 *
 * TODO: 要統合。
 * 現状、Workspace/index.tsxからFormColumnを呼び出すためだけに存在している
 * Tree.tsxからはFormColumnは直接呼出されるので、このTreeAsFormを使用していない
 * つまり
 * FormColumnを呼び出す手段は現在二つあるという状態
 *
 * 実際使ってみるとTreeAsFormを使う方法だと処理が遅い*****************************************************************************/
import React, { useState } from 'react';
import FormColumn from './FormColumn';
import { isFilenameValid, isFolderNameValid } from '../../../utils';
import type { iExplorer } from '../../../data/types';

interface iProps {
  nestDepth: number;
  explorer: iExplorer;
  showInput: { visible: boolean; isFolder: boolean };
  setShowInput: (o: { visible: boolean; isFolder: boolean }) => void;
  handleInsertNode: (requiredPath: string, isFolder: boolean) => void;
  checkPathAlreadyExistsFromExplorer: (path: string) => boolean;
}

const defaultNewFileName = 'Untitled.file.js';
const defaultNewDirectoryName = 'Untitled';

const TreeAsForm: React.FC<iProps> = ({
  explorer,
  nestDepth,
  handleInsertNode,
  showInput,
  setShowInput,
  checkPathAlreadyExistsFromExplorer,
}) => {
  // true if FormColumn input has started to be input.
  const [isInputBegun, setIsInputBegun] = useState<boolean>(false);
  // true if provided value to FormColun input is valid as file|folder name.
  const [isNameValid, setIsNameValid] = useState<boolean>(false);
  // true if provided value to FormColun input is empty.
  const [isNameEmpty, setIsNameEmpty] = useState<boolean>(false);
  // true if provided value to FormColumn input makes path which is already exists.
  const [isSameNameAlreadyExists, setIsSameNameAlreadyExists] =
    useState<boolean>(false);

  /***
   * Dispatches passed value to transform as path to
   * FilesContext to add item
   * when FormColumn input form emit formevent.
   *
   * */
  const onAddItem = (providedValue: string) => {
    const requiredPath = explorer.path.length
      ? explorer.path + '/' + providedValue
      : providedValue;

    handleInsertNode(requiredPath, showInput.isFolder);
    setShowInput({ ...showInput, visible: false });
    setIsInputBegun(false);
    setIsNameValid(false);
    setIsNameEmpty(false);
    setIsSameNameAlreadyExists(false);
  };

  /**
   * This method will be invoked by FormColumn onchange event
   * to check provided value/state is valid.
   * */
  const handleNewItemNameInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    isFolder: boolean
  ) => {
    setIsInputBegun(true);

    // Check if input form is empty.
    e.currentTarget.value.length ? setIsNameEmpty(false) : setIsNameEmpty(true);

    // NOTE: renamingなのか新規アイテム追加なのかでisPathAlreadyExistsの生成方法が異なる
    // src/以下に新規アイテムを追加しようとした：戻り値null
    // src/以下のアイテムをリネームした：戻り値'src/'
    const isPathAlreadyExists = checkPathAlreadyExistsFromExplorer(
      explorer.path + '/' + e.currentTarget.value
    );
    isPathAlreadyExists
      ? setIsSameNameAlreadyExists(true)
      : setIsSameNameAlreadyExists(false);

    // Check if value is valid
    if (
      isFolder &&
      isFolderNameValid(e.currentTarget.value) &&
      !isPathAlreadyExists
    ) {
      setIsNameValid(true);
    } else if (isFilenameValid(e.currentTarget.value) && !isPathAlreadyExists) {
      setIsNameValid(true);
    } else {
      setIsNameValid(false);
    }
  };

  /************************************
   * Determine styles
   * **********************************/

  const columnIndent = `${nestDepth * 1.6}rem`;

  // Indent for new item input form
  //   const columnIndentForNewItemForm = `${nestDepth * 1.6 + 1.6}rem`;
  // input.inputContainer--inputの動的style
  let inputStyle = {};
  if (isInputBegun && isNameValid) {
    // 入力（フォーカス）中且つ入力内容に問題ない
    inputStyle = { border: '1px solid cyan' };
  } else if (isInputBegun && !isNameValid) {
    // 入力（フォーカス）中且つ入力内容に問題あり
    inputStyle = { border: '1px solid red' };
  }

  return (
    <div>
      <FormColumn
        id={explorer.id}
        columnIndent={columnIndent}
        isFolder={explorer.isFolder}
        name={explorer.name}
        isNameEmpty={isNameEmpty}
        isInputBegun={isInputBegun}
        isNameValid={isNameValid}
        isSameNameAlreadyExists={isSameNameAlreadyExists}
        handleNewItemNameInput={handleNewItemNameInput}
        callbackOnKeyDown={onAddItem}
        setIsInputBegun={setIsInputBegun}
        displayForm={(flag: boolean) => {
          if (!flag) {
            setShowInput({ ...showInput, visible: false });
          }
        }}
        inputStyle={inputStyle}
      />
    </div>
  );
};

export default TreeAsForm;
