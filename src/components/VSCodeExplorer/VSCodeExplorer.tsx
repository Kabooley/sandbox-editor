/*****************************************************************************
 * UI where each section is stackable and resizable, like the VSCode sidebar
 *
 * Number of Stack is three.
 *
 * NOTE:
 * - Sum of updated height of each stack on resize must be 0. No measure error allowed.
 *    `Resize` includes window/parent resize and stack resize.
 *
 * - Stackの数を変更する場合、変更すべき場所は主に`getMaxConstraints`である。
 *   あと`getMaxConstraints`呼び出し時の引数の修正も忘れないように。
 *
 * - react-resizale Resizableのhandleを表示するために、Resizable > divというペアは必須でなくてはならない
 *    つまり、Resizableの直接の子コンポーネントは組み込みコンポーネントでなくてはならないということ。
 *    カスタムコンポーネントはその組み込みコンポーネントの子コンポーネントとすること。
 *    custom-handleに関する説明は公式に載っていないに等しいのでこの通りの措置をとる。
 * ***************************************************************************/
import React, { useState, useEffect, useRef } from 'react';
import { Resizable } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import OpenEditor from './OpenEditor';
import VirtualFolder from './Workspace';
import Dependencies from './Dependencies';

type iAxis = 'y' | 'none';
interface iProps {
    width: number;
    height: number;
}

/***
 * Constants:
 * - collapsingHeightOfSection: Height px of stack when stack is collapsing.
 * - rateOfMinHeightOfSection: Minimum height of each stack's ResizableBox when stack is not collapsing.
 * */
const collapsingHeightOfSection = 24;
const rateOfMinHeightOfSection = 0.15;
const numberOfStacks = 3;

const VSCodeExplorer: React.FC<iProps> = ({ width, height }) => {
    const explorerHeight = height;
    const _minConstraints = explorerHeight * rateOfMinHeightOfSection;

    /**
     * Height of each stack when stack is not collapsing.
     * Section height is not managed when the section is collapsing.
     **/
    const [stackOneHeight, setStackOneHeight] =
        useState<number>(_minConstraints);
    const [stackTwoHeight, setStackTwoHeight] = useState<number>(
        explorerHeight - _minConstraints * 3
    );
    const [stackThreeHeight, setStackThreeHeight] =
        useState<number>(_minConstraints);

    /**
     * Decieds stack's body to be collapsed.
     * `true` as collapse.
     **/
    const [collapseStackOne, setCollapseStackOne] = useState<boolean>(true);
    const [collapseStackTwo, setCollapseStackTwo] = useState<boolean>(true);
    const [collapseStackThree, setCollapseStackThree] = useState<boolean>(true);

    /**
     * Dragging stack number will be set.
     * Pass 0 if nothing is dragging.
     */
    const [dragging, setDragging] = useState<number>(0);
    /***
     *
     * dragging: not 0の時の最後のマウスの座標
     * onResizeStartのときにゼロ以外が与えられて、onResizeStopの時にゼロにリセットされる
     * */
    const [lastMouseClientY, setLastMouseClientY] = useState<number>(0);

    /***
     * Memorize previous height of this explorer
     * so that thay can reference when passed height parametere is changed.
     * */
    const refPreviousSidebarHeight = useRef<number>(height);

    /**
     * Manager of parent/Window resize
     * Reset each stack height when parameter height has been changed.
     * Also upadte `refPreviousSidebarHeight`.
     *
     * TODO: Check if udpated height is not over maxConstraints and less than _minConstraints.
     * */
    useEffect(() => {
        if (refPreviousSidebarHeight.current) {
            const updatedStackOneHeight =
                height * (stackOneHeight / refPreviousSidebarHeight.current);
            const updatedStackTwoHeight =
                height * (stackTwoHeight / refPreviousSidebarHeight.current);
            const updatedStackThreeHeight =
                height * (stackThreeHeight / refPreviousSidebarHeight.current);
            // 負の値なら合計値は長すぎて、静の値なら合計値は足りていない
            const measureError =
                explorerHeight -
                (collapseStackOne
                    ? collapsingHeightOfSection
                    : updatedStackOneHeight) -
                (collapseStackTwo
                    ? collapsingHeightOfSection
                    : updatedStackTwoHeight) -
                (collapseStackThree
                    ? collapsingHeightOfSection
                    : updatedStackThreeHeight);
            // @ts-ignore
            const nextMaxConstraints = getMaxConstraints();

            // // DEBUG:
            // console.log(
            //   `[VSCodeExplorer] update explorer height ${refPreviousSidebarHeight.current} to be ${height}`
            // );
            // console.log(`[VSCodeExplorer] MeasureError: ${measureError}`);

            // 誤差修正と各stack heightの更新
            let isFixedMeasureError = false;
            [
                { height: updatedStackOneHeight, set: setStackOneHeight },
                { height: updatedStackTwoHeight, set: setStackTwoHeight },
                { height: updatedStackThreeHeight, set: setStackThreeHeight },
            ].forEach((stack) => {
                if (
                    !isFixedMeasureError &&
                    stack.height + measureError > _minConstraints &&
                    stack.height + measureError < nextMaxConstraints
                ) {
                    stack.set(stack.height + measureError);
                    isFixedMeasureError = true;
                } else {
                    stack.set(stack.height);
                }
            });
            //
            refPreviousSidebarHeight.current = height;
        }
    }, [height]);

    // // DEBUG:
    // useEffect(() => {
    //   const measureError =
    //     explorerHeight -
    //     (collapseStackOne ? collapsingHeightOfSection : stackOneHeight) -
    //     (collapseStackTwo ? collapsingHeightOfSection : stackTwoHeight) -
    //     (collapseStackThree ? collapsingHeightOfSection : stackThreeHeight);

    //   console.log("[VSCodeExplorer] did update:");
    //   console.log(
    //     `measureError/explorerHeight: ${measureError}/${explorerHeight}`
    //   );
    //   console.log(
    //     `stack one height: ${
    //       collapseStackOne ? collapsingHeightOfSection : stackOneHeight
    //     }/${stackOneHeight}`
    //   );
    //   console.log(
    //     `stack two height: ${
    //       collapseStackTwo ? collapsingHeightOfSection : stackTwoHeight
    //     }/${stackTwoHeight}`
    //   );
    //   console.log(
    //     `stack three height: ${
    //       collapseStackThree ? collapsingHeightOfSection : stackThreeHeight
    //     }/${stackThreeHeight}`
    //   );
    // });

    const sections = [
        {
            index: 1,
            collapse: collapseStackOne,
            height: stackOneHeight,
            setHeight: setStackOneHeight,
        },
        {
            index: 2,
            collapse: collapseStackTwo,
            height: stackTwoHeight,
            setHeight: setStackTwoHeight,
        },
        {
            index: 3,
            collapse: collapseStackThree,
            height: stackThreeHeight,
            setHeight: setStackThreeHeight,
        },
    ];

    //===========================================================
    // Resizable resize handlers
    //===========================================================
    /***
     * Variables:
     *
     *    - diff:  前回のstack one heightの値と今回のリサイズ後のstack one heightの差。
     *        負の値ならstack oneは縮み、静の値なら伸びている。
     *    - isMouseMovingUp: 前回のマウス座標と今回のマウス座標を比較してマウスが上下方向のどちらへ移動したのかの値
     *    - _maxConstraints: ResizableプロパティのmaxConstraintsへ渡す値。
     *    - _minConstraints: ResizableプロパティのminConstraintsへ渡す値。
     *
     * `if(diff > 0)`:　そのstackを縮めるとき。
     *
     *    縮める大きさは`diff`である。
     *    そのstackの下位stackのうち、`collapse: false`であり且つそのstackから最も近いstack一つを`diff`だけ拡大する。
     *    拡大するstackのheightが_maxConstraintsに到達したら次に近い同条件のstackを`diff`だけ拡大する。
     *    常にすべての変更後のstackのheightの合計がexplorerHeightと一致するようにする。
     *    一致する場合にのみ変更を適用し、一致しないときは変更を適用しない。
     *
     * `if(diff < 0)`: そのstackを拡大するとき。
     *
     *    拡大する大きさは`diff`である.
     *    そのstackの下位stackのうち、`collapse: false`であり且つそのstackから最も近いstack一つを`diff`だけ縮小する。
     *    拡大するstackのheightが_minConstraintsに到達したら次に近い同条件のstackを`diff`だけ縮小する。
     *    常にすべての変更後のstackのheightの合計がexplorerHeightと一致するようにする。
     *    一致する場合にのみ変更を適用し、一致しないときは変更を適用しない。
     *
     * TODO: 低優先) collapse: trueのstackでもハンドルを動かせるようにする。
     *
     * */

    /***
     * Resize stack one height.
     * */
    const onResizeStackOne = (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => {
        if (dragging !== 1) {
            return;
        }
        const { node, size, handle } = data;
        const diff = stackOneHeight - size.height;
        const _maxConstraints = getMaxConstraints();
        const isMouseMovingUp = lastMouseClientY - e.clientY > 0 ? true : false;
        setLastMouseClientY(e.clientY);

        // console.log(`------`);
        // console.log(`set stack one height: ${size.height}`);
        // console.log(`mouse moving ${isMouseMovingUp ? "UP" : "DOWN"}`);

        // Expand other stack
        // Change the opening stack just below stack one.
        if (diff > 0) {
            // DEBUG:
            // console.log("Expand other stack");

            const updatedHeights: {
                index: number;
                height: number;
                set: (height: number) => void;
                collapse: boolean;
            }[] = [];
            let expanded = false;
            sections.forEach((section) => {
                if (
                    section.index > 1 &&
                    !section.collapse &&
                    section.height + diff <= _maxConstraints &&
                    !expanded
                ) {
                    updatedHeights.push({
                        index: section.index,
                        height: section.height + diff,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                    expanded = true;
                } else if (section.index === 1) {
                    updatedHeights.push({
                        index: section.index,
                        height: size.height,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                } else {
                    updatedHeights.push({
                        index: section.index,
                        height: section.height,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                }
            });
            const sumOfUpdatedHeights = updatedHeights.reduce((a, c) => {
                if (c.collapse) return a + collapsingHeightOfSection;
                else return a + c.height;
            }, 0);
            if (
                sumOfUpdatedHeights > explorerHeight ||
                sumOfUpdatedHeights < explorerHeight
            ) {
                // DEBUG:
                // console.log("Unapply updates.");
                // console.log("each updated heights:");
                // updatedHeights.forEach((update) => console.log(update.height));
                // console.log(`sum of heights: ${sumOfUpdatedHeights}`);
                // console.log(
                //   `Diff of sidebarHeight minus sumOfUpdatedHeights: ${
                //     explorerHeight - sumOfUpdatedHeights
                //   }`
                // );
                return;
            }
            // console.log("Update applied!");

            updatedHeights.forEach((h) => {
                if (!h.collapse) h.set(h.height);
            });
            return;
        }
        // Shrink other stack so that stack one can be expanded.
        else if (diff < 0) {
            // console.log("Shrink other stack");

            const updatedHeights: {
                index: number;
                height: number;
                set: (height: number) => void;
                collapse: boolean;
            }[] = [];
            let shrinked = false;
            sections.forEach((section) => {
                if (
                    section.index > 1 &&
                    !section.collapse &&
                    section.height + diff >= _minConstraints &&
                    !shrinked
                ) {
                    updatedHeights.push({
                        index: section.index,
                        height: section.height + diff,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                    shrinked = true;
                } else if (section.index === 1) {
                    updatedHeights.push({
                        index: section.index,
                        height: size.height,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                } else {
                    updatedHeights.push({
                        index: section.index,
                        height: section.height,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                }
            });
            const sumOfUpdatedHeights = updatedHeights.reduce((a, c) => {
                if (c.collapse) return a + collapsingHeightOfSection;
                else return a + c.height;
            }, 0);
            if (
                sumOfUpdatedHeights > explorerHeight ||
                sumOfUpdatedHeights < explorerHeight
            ) {
                // DEBUG:
                // console.log("Unapply updates.");
                // console.log("each updated heights:");
                // updatedHeights.forEach((update) => console.log(update.height));
                // console.log(`sum of heights: ${sumOfUpdatedHeights}`);
                // console.log(
                //   `Diff of sidebarHeight minus sumOfUpdatedHeights: ${
                //     explorerHeight - sumOfUpdatedHeights
                //   }`
                // );
                return;
            }
            // console.log("Update applied!");

            updatedHeights.forEach((h) => {
                if (!h.collapse) h.set(h.height);
            });
            return;
        }
    };

    /***
     * Resize stack two height.
     * */
    const onResizeStackTwo = (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => {
        if (dragging !== 2) {
            return;
        }

        const { node, size, handle } = data;
        const diff = stackTwoHeight - size.height;
        const _maxConstraints = getMaxConstraints();
        const isMouseMovingUp = lastMouseClientY - e.clientY > 0 ? true : false;
        setLastMouseClientY(e.clientY);

        // DEBUG:
        // console.log(`------`);
        // console.log(`set stack two height: ${size.height}`);
        // console.log(`mouse moving ${isMouseMovingUp ? "UP" : "DOWN"}`);
        // console.log(`diff: ${diff}`);

        // Expand other stack so that stack two can be shrinked.
        if (diff > 0) {
            // console.log("Expand other stack");

            const updatedHeights: {
                index: number;
                height: number;
                set: (height: number) => void;
                collapse: boolean;
            }[] = [];
            let expanded = false;
            sections.forEach((section) => {
                if (
                    section.index > 2 &&
                    !section.collapse &&
                    section.height + diff <= _maxConstraints &&
                    !expanded
                ) {
                    updatedHeights.push({
                        index: section.index,
                        height: section.height + diff,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                    expanded = true;
                } else if (section.index === 2) {
                    updatedHeights.push({
                        index: section.index,
                        height: size.height,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                } else {
                    updatedHeights.push({
                        index: section.index,
                        height: section.height,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                }
            });
            const sumOfUpdatedHeights = updatedHeights.reduce((a, c) => {
                if (c.collapse) return a + collapsingHeightOfSection;
                else return a + c.height;
            }, 0);
            if (
                sumOfUpdatedHeights > explorerHeight ||
                sumOfUpdatedHeights < explorerHeight
            ) {
                // DEBUG:
                // console.log("Unapply updates.");
                // console.log("each updated heights:");
                // updatedHeights.forEach((update) => console.log(update.height));
                // console.log(`sum of heights: ${sumOfUpdatedHeights}`);
                // console.log(
                //   `Diff of sidebarHeight minus sumOfUpdatedHeights: ${
                //     explorerHeight - sumOfUpdatedHeights
                //   }`
                // );
                return;
            }
            // DEBUG:
            // console.log("Apply updates.");
            updatedHeights.forEach((h) => {
                if (!h.collapse) h.set(h.height);
            });
            return;
        }
        // Shrink other stack so that stack two can be expanded.
        else if (diff < 0) {
            // console.log("Shrink other stack");

            const updatedHeights: {
                index: number;
                height: number;
                set: (height: number) => void;
                collapse: boolean;
            }[] = [];
            let shrinked = false;
            sections.forEach((section) => {
                if (
                    section.index > 2 &&
                    !section.collapse &&
                    section.height + diff >= _minConstraints &&
                    !shrinked
                ) {
                    updatedHeights.push({
                        index: section.index,
                        height: section.height + diff,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                    shrinked = true;
                } else if (section.index === 2) {
                    updatedHeights.push({
                        index: section.index,
                        height: size.height,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                } else {
                    updatedHeights.push({
                        index: section.index,
                        height: section.height,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                }
            });
            const sumOfUpdatedHeights = updatedHeights.reduce((a, c) => {
                if (c.collapse) return a + collapsingHeightOfSection;
                else return a + c.height;
            }, 0);
            if (
                sumOfUpdatedHeights > explorerHeight ||
                sumOfUpdatedHeights < explorerHeight
            ) {
                // DEBUG:
                // console.log("Unapply updates.");
                // console.log("each updated heights:");
                // updatedHeights.forEach((update) => console.log(update.height));
                // console.log(`sum of heights: ${sumOfUpdatedHeights}`);
                // console.log(
                //   `Diff of explorerHeight minus sumOfUpdatedHeights: ${
                //     explorerHeight - sumOfUpdatedHeights
                //   }`
                // );
                return;
            }
            // DEBUG:
            // console.log("Apply updates.");
            updatedHeights.forEach((h) => {
                if (!h.collapse) h.set(h.height);
            });
            return;
        }
        // // move stack two top
        // else if (diff === 0) {
        //   // ここにはstack twoがすでにmaxConstraintsまたはminConstraintsであるにもかかわらず
        //   // ハンドルをづドラッグしたまま動かしているときにどうするかをここで定義する...
        //   // とおもったけどリサイズハンドルを動かしている限りdiffは0にめったにならないので意味ないかも
        //   console.log(
        //     "stack height is stable but mouse is still dragging and moving"
        //   );
        // }

        // console.log(`------`);
    };

    /***
     * Resize stack three height.
     * */
    const onResizeStackThree = (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => {
        if (dragging !== 3) {
            return;
        }
        const { node, size, handle } = data;
        const diff = stackThreeHeight - size.height;
        const _maxConstraints = getMaxConstraints();
        const isMouseMovingUp = lastMouseClientY - e.clientY > 0 ? true : false;
        setLastMouseClientY(e.clientY);

        // DEBUG:
        // console.log(`------`);
        // console.log(`set stack three height: ${size.height}`);
        // console.log(`mouse moving ${isMouseMovingUp ? "UP" : "DOWN"}`);
        // console.log(`diff: ${diff}`);

        // Expand other stack. stack three is shrinking or changing its top.
        if (diff > 0) {
            // DEBUG:
            // console.log("Expand other stack");

            const updatedHeights: {
                index: number;
                height: number;
                set: (height: number) => void;
                collapse: boolean;
            }[] = [];
            let shrinked = false;
            sections.forEach((section) => {
                if (
                    section.index > 3 &&
                    !section.collapse &&
                    section.height + diff <= _maxConstraints &&
                    !shrinked
                ) {
                    updatedHeights.push({
                        index: section.index,
                        height: section.height + diff,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                    shrinked = true;
                } else if (section.index === 3) {
                    updatedHeights.push({
                        index: section.index,
                        height: size.height,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                } else {
                    updatedHeights.push({
                        index: section.index,
                        height: section.height,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                }
            });
            const sumOfUpdatedHeights = updatedHeights.reduce((a, c) => {
                if (c.collapse) return a + collapsingHeightOfSection;
                else return a + c.height;
            }, 0);
            if (
                sumOfUpdatedHeights > explorerHeight ||
                sumOfUpdatedHeights < explorerHeight
            ) {
                // DEBUG:
                // console.log("Unapply updates.");
                // console.log("each updated heights:");
                // updatedHeights.forEach((update) => console.log(update.height));
                // console.log(`sum of heights: ${sumOfUpdatedHeights}`);
                // console.log(
                //   `Diff of explorerHeight minus sumOfUpdatedHeights: ${
                //     explorerHeight - sumOfUpdatedHeights
                //   }`
                // );
                return;
            }
            // DEBUG:
            // console.log("Apply updates.");
            updatedHeights.forEach((h) => {
                if (!h.collapse) h.set(h.height);
            });
            return;
        }
        // Shrink other stack. stack three is expanding or changing its top.
        else if (diff < 0) {
            // DEBUG:
            // console.log("Shrink other stack");

            const updatedHeights: {
                index: number;
                height: number;
                set: (height: number) => void;
                collapse: boolean;
            }[] = [];
            let shrinked = false;
            sections.forEach((section) => {
                if (
                    section.index > 3 &&
                    !section.collapse &&
                    section.height + diff >= _minConstraints &&
                    !shrinked
                ) {
                    updatedHeights.push({
                        index: section.index,
                        height: section.height + diff,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                    shrinked = true;
                } else if (section.index === 3) {
                    updatedHeights.push({
                        index: section.index,
                        height: size.height,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                } else {
                    updatedHeights.push({
                        index: section.index,
                        height: section.height,
                        set: section.setHeight,
                        collapse: section.collapse,
                    });
                }
            });
            const sumOfUpdatedHeights = updatedHeights.reduce((a, c) => {
                if (c.collapse) return a + collapsingHeightOfSection;
                else return a + c.height;
            }, 0);
            if (
                sumOfUpdatedHeights > explorerHeight ||
                sumOfUpdatedHeights < explorerHeight
            ) {
                // DEBUG:
                // console.log("Unapply updates.");
                // console.log("each updated heights:");
                // updatedHeights.forEach((update) => console.log(update.height));
                // console.log(`sum of heights: ${sumOfUpdatedHeights}`);
                // console.log(
                //   `Diff of explorerHeight minus sumOfUpdatedHeights: ${
                //     explorerHeight - sumOfUpdatedHeights
                //   }`
                // );
                return;
            }
            // DEBUG:
            // console.log("Apply updates.");
            updatedHeights.forEach((h) => {
                if (!h.collapse) h.set(h.height);
            });
            return;
        }
    };

    // なぜかこいつだとうまくいかない
    // 違いがあったかしら？
    //
    // const onResizeStack = (
    //   e: React.SyntheticEvent,
    //   data: ResizeCallbackData,
    //   index: number
    // ) => {
    //   if (dragging !== index) {
    //     return;
    //   }

    //   const { node, size, handle } = data;
    //   const diff = stackTwoHeight - size.height;
    //   const _maxConstraints = getMaxConstraints();
    //   const isMouseMovingUp = lastMouseClientY - e.clientY > 0 ? true : false;
    //   setLastMouseClientY(e.clientY);

    //   // DEBUG:
    //   console.log(`------`);
    //   console.log(`set stack ${index} height: ${size.height}`);
    //   console.log(`mouse moving ${isMouseMovingUp ? "UP" : "DOWN"}`);
    //   console.log(`diff: ${diff}`);

    //   // Expand other stack so that stack two can be shrinked.
    //   if (diff > 0) {
    //     // DEBUG:
    //     console.log("Expand other stack");

    //     const updatedHeights: {
    //       index: number;
    //       height: number;
    //       set: (height: number) => void;
    //       collapse: boolean;
    //     }[] = [];
    //     let expanded = false;
    //     sections.forEach((section) => {
    //       if (
    //         section.index > index &&
    //         !section.collapse &&
    //         section.height + diff <= _maxConstraints &&
    //         !expanded
    //       ) {
    //         updatedHeights.push({
    //           index: section.index,
    //           height: section.height + diff,
    //           set: section.setHeight,
    //           collapse: section.collapse,
    //         });
    //         expanded = true;
    //       } else if (section.index === index) {
    //         updatedHeights.push({
    //           index: section.index,
    //           height: size.height,
    //           set: section.setHeight,
    //           collapse: section.collapse,
    //         });
    //       } else {
    //         updatedHeights.push({
    //           index: section.index,
    //           height: section.height,
    //           set: section.setHeight,
    //           collapse: section.collapse,
    //         });
    //       }
    //     });
    //     const sumOfUpdatedHeights = updatedHeights.reduce((a, c) => {
    //       if (c.collapse) return a + collapsingHeightOfSection;
    //       else return a + c.height;
    //     }, 0);
    //     if (
    //       sumOfUpdatedHeights > explorerHeight ||
    //       sumOfUpdatedHeights < explorerHeight
    //     ) {
    //       console.log("Unapply updates.");
    //       console.log("each updated heights:");
    //       updatedHeights.forEach((update) => console.log(update.height));
    //       console.log(`sum of heights: ${sumOfUpdatedHeights}`);
    //       return;
    //     }
    //     console.log("Apply updates.");
    //     updatedHeights.forEach((h) => {
    //       if (!h.collapse) h.set(h.height);
    //     });
    //     return;
    //   }
    //   // Shrink other stack so that stack two can be expanded.
    //   else if (diff < 0) {
    //     // DEBUG:
    //     console.log("Shrink other stack");

    //     const updatedHeights: {
    //       index: number;
    //       height: number;
    //       set: (height: number) => void;
    //       collapse: boolean;
    //     }[] = [];
    //     let shrinked = false;
    //     sections.forEach((section) => {
    //       if (
    //         section.index > index &&
    //         !section.collapse &&
    //         section.height + diff >= _minConstraints &&
    //         !shrinked
    //       ) {
    //         updatedHeights.push({
    //           index: section.index,
    //           height: section.height + diff,
    //           set: section.setHeight,
    //           collapse: section.collapse,
    //         });
    //         shrinked = true;
    //       } else if (section.index === index) {
    //         updatedHeights.push({
    //           index: section.index,
    //           height: size.height,
    //           set: section.setHeight,
    //           collapse: section.collapse,
    //         });
    //       } else {
    //         updatedHeights.push({
    //           index: section.index,
    //           height: section.height,
    //           set: section.setHeight,
    //           collapse: section.collapse,
    //         });
    //       }
    //     });
    //     const sumOfUpdatedHeights = updatedHeights.reduce((a, c) => {
    //       if (c.collapse) return a + collapsingHeightOfSection;
    //       else return a + c.height;
    //     }, 0);
    //     if (
    //       sumOfUpdatedHeights > explorerHeight ||
    //       sumOfUpdatedHeights < explorerHeight
    //     ) {
    //       return;
    //     }
    //     updatedHeights.forEach((h) => {
    //       if (!h.collapse) h.set(h.height);
    //     });
    //     return;
    //   }
    //   // // move stack two top
    //   // else if (diff === 0) {
    //   //   // ここにはstackがすでにmaxConstraintsまたはminConstraintsであるにもかかわらず
    //   //   // ハンドルをづドラッグしたまま動かしているときにどうするかをここで定義する...
    //   //   // とおもったけどリサイズハンドルを動かしている限りdiffは0にめったにならないので意味ないかも
    //   //   console.log(
    //   //     "stack height is stable but mouse is still dragging and moving"
    //   //   );
    //   // }

    //   // DEBUG:
    //   console.log(`------`);
    // };

    // const handleSectionClick = (sectionNumber: number) => {
    const handleSectionClick = (
        e: React.MouseEvent<HTMLDivElement>,
        sectionNumber: number
    ) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        switch (sectionNumber) {
            case 1: {
                setStackHeight(1, !collapseStackOne);
                setCollapseStackOne(!collapseStackOne);
                return;
            }
            case 2: {
                setStackHeight(2, !collapseStackTwo);
                setCollapseStackTwo(!collapseStackTwo);
                return;
            }
            case 3: {
                setStackHeight(3, !collapseStackThree);
                setCollapseStackThree(!collapseStackThree);
                return;
            }
            default: {
                return;
            }
        }
    };

    /***
     * Returns value of ResizableBox's property `maxConstraints`
     * according to current number of collapsing stacks
     * or passed value.
     *
     * ResizableBoxのmaxConstraintsプロパティを現在のstackの状態に応じて返す関数である
     * */
    const getMaxConstraints = (collapsings?: number) => {
        // Number of collapsing stacks.
        const _collapsings =
            collapsings === undefined
                ? [
                      collapseStackOne,
                      collapseStackTwo,
                      collapseStackThree,
                  ].filter(Boolean).length
                : collapsings;

        switch (_collapsings) {
            case 1: {
                /***
                 * 閉じているstackがひとつのとき：
                 * 開いているstackのうち1つはminConstraintsをとるとしたときの
                 * 残る一つのstackのheightがとりうる最大値
                 * */
                return (
                    explorerHeight -
                    collapsingHeightOfSection -
                    explorerHeight * rateOfMinHeightOfSection
                );
            }
            case 2: {
                /**
                 * 閉じているstackが二つのとき：
                 * 開いている唯一のstackのheightの取りうる最大値
                 ***/
                return explorerHeight - collapsingHeightOfSection * 2;
            }
            case 3: {
                /***
                 * すべてのstackが閉じているとき：
                 * */
                return explorerHeight * rateOfMinHeightOfSection;
            }
            default: {
                /**
                 * すべてのstackが開いているとき
                 * */
                return (
                    explorerHeight -
                    explorerHeight * rateOfMinHeightOfSection * 2
                );
            }
        }
    };

    /***
     * あるstackのcollapse値を変更したときに、explorer領域内に収まるよう各stackのheightを再計算する
     *
     * @param {number} stackIndex - collapseを変更したstackの番号
     * @param {boolean} willStackCollapse - stackIndexであるstackがこれからなるcollapseの状態
     *
     * NOTE: stackが閉じているときのheight、開いているstackが一つだけの時のheightはここでは扱わない。
     * 上記のheightは毎レンダリング時に設定される。
     * */
    /***
     * Variables:
     *    - `target`: 引数`stackIndex`が指す`sections`の中のstack。
     *    - `numberOfOpeningStack`: 現在`collapse: false`であるstackの数。
     *
     * In case `willStackCollapse: true`:
     *
     *    分岐１） 開いているstackが一つだけの時：
     *        すべてのstackを閉じることになるので何もしない。state管理のheightはcollapse:trueの時の高さを管理しないから。
     *
     *    分岐２） 2つ以上のstackが開いているとき：
     *        - `expandLength`: `target` stackを閉じることで生まれる空きスペースであり、ほかの開いているstackに割り振らなくてはならない値。
     *        - `openingBelowStacks`: `target` stackより下位の開いてるstack
     *        - `remainder`: ほかの開いているstackへ割り振るスペースの残り。
     *
     *        `openingBelowStacks`の各stackへremainderを割り振っていく。
     *        具体的には割り振るstackのheightとremainderの和をそのstackへsetHeightする。
     *        setHeightする値が`nextMaxConstraints`を超える場合は
     *        `remainder`を更新し別のstackを同様に変更していく。
     *        `openingBelowStack`へ変更を施していくだけでは足りない場合、
     *        残りのstackにも同様に処理していきremainderがゼロになるまで続ける。
     *
     * In case `willStackCollapse: false`:
     *
     *    分岐１） stackがすべて閉じているなかで一つだけstackを開くとき：
     *        `target` stackのheightを、閉じているstackが３つのときのmaxConstraintsにする
     *
     *    分岐２） 複数stackが開いているときに`target` stackを開くとき：
     *        `shrinkLength`分他の開いてるstackを縮めることで、`target` stackの展開領域を確保する処理を行う。
     *
     *        - `shrinkLength`: `target` stackを開くために必要なスペース
     *        - `nextMaxConstraints`: `target` stackのcollapseの変更を適用した後のmaxConstraints値
     *        - `remainder`: 確保しなくてはならないスペースの残り。各stackを縮小していくごとに減っていく。
     *
     *        そもそも`target` stackのheightが、`nextMaxConstraints`を超えていたら、`target` stackのheightは`nextMaxConstraints`と同じになり、
     *        差分だけ`remainder`を縮める。
     *        開いているstackをheightが大きい順に並べて上から`remainder`がゼロになるまで各stackのheightを縮めていく。
     *        remainderがゼロになったら縮小処理は完了
     *        stackを縮小するので、縮小後のheightが`_minConstraints`以下にならないように注意する。
     *
     *
     * */
    const setStackHeight = (stackIndex: number, willStackCollapse: boolean) => {
        // Stack indicated by the `stackIndex` argument
        const target = sections.find((section) => section.index === stackIndex);
        // Number of opening stacks before applying changes.
        const numberOfOpeningStack = sections.filter(
            (section) => !section.collapse
        ).length;

        if (target === undefined)
            throw new Error(
                'Error @sidebar. Something went wrong. But sidebar stack section could not found by `stackIndex`.'
            );

        // On close a stack: Expand other opening stack.
        if (willStackCollapse) {
            /***
             * 1. Close all stacks:
             *    Size of collapsing stack is not managed by state.
             * */
            if (numberOfOpeningStack === 1 && !target.collapse) {
                return;
            }
            /***
             * 2. Expand lowest stack when opening stacks are more than one.
             * */
            const expandLength = target.height - collapsingHeightOfSection;
            // const restSpace =
            //   explorerHeight -
            //   collapsingHeightOfSection -
            //   sections.reduce((a, c) => {
            //     if (c.index < stackIndex)
            //       return a + (c.collapse ? collapsingHeightOfSection : c.height);
            //     else return a + 0;
            //   }, 0);
            const openingBelowStacks = sections.filter(
                (section) => !section.collapse && section.index > stackIndex
            );
            // const sumOfStackHeightBelow = sections.reduce((a, c) => {
            //   if (c.collapse && c.index > stackIndex)
            //     return a + collapsingHeightOfSection;
            //   else if (!c.collapse && c.index > stackIndex) return a + c.height;
            //   else return a + 0;
            // }, 0);
            const nextMaxConstraints = getMaxConstraints(
                sections.filter((section) => section.collapse).length + 1
            );

            // // DEBUG:
            // console.log(`expand other stacks.`);
            // console.log(`expandLength: ${expandLength}`);
            // console.log(`restSpace: ${restSpace}`);
            // console.log(`sumOfStackHeightBelow: ${sumOfStackHeightBelow}`);
            // console.log(
            //   `Is restSpace enough for other stacks?: ${
            //     restSpace >= sumOfStackHeightBelow
            //   }`
            // );

            let remainder = expandLength;
            openingBelowStacks.every((stack) => {
                if (stack.height + remainder > nextMaxConstraints) {
                    stack.setHeight(nextMaxConstraints);
                    remainder = stack.height + remainder - nextMaxConstraints;
                    return true;
                } else if (stack.height + remainder <= nextMaxConstraints) {
                    stack.setHeight(stack.height + remainder);
                    remainder = 0;
                    return false;
                }
            });

            // console.log(
            //   `Is sum of each stack's height equal to explorer height? : ${
            //     0 +
            //     (collapseStackOne ? collapsingHeightOfSection : stackOneHeight) +
            //     (collapseStackTwo ? collapsingHeightOfSection : stackTwoHeight) +
            //     (collapseStackThree ? collapsingHeightOfSection : stackThreeHeight) +
            //     (collapseStackFour ? collapsingHeightOfSection : stackFourHeight)
            //   }`
            // );
            if (remainder > 0) {
                console.error(`expand need yet. Expand ${remainder}`);
                const openingAboveStacks = sections.filter(
                    (section) => !section.collapse && section.index < stackIndex
                );
                if (openingAboveStacks.length) {
                    // 先ほどと同様のことを行う
                    openingAboveStacks.every((stack) => {
                        if (stack.height + remainder > nextMaxConstraints) {
                            stack.setHeight(nextMaxConstraints);
                            remainder =
                                stack.height + remainder - nextMaxConstraints;
                            return true;
                        } else if (
                            stack.height + remainder <=
                            nextMaxConstraints
                        ) {
                            stack.setHeight(stack.height + remainder);
                            remainder = 0;
                            return false;
                        }
                    });
                } else {
                    console.error(`Cannot expand anymore`);
                }
            }
        }
        // on open stack two: shrink other opening stack
        else {
            // 1. Open one stack when all stacks are closed
            if (!numberOfOpeningStack) {
                // // DEBUG:
                // console.log(`Open ${stackIndex} stack when all other stack are closed`);

                target.setHeight(getMaxConstraints(numberOfStacks - 1));
                return;
            }
            // target stackが閉じていた時のheightと開くときに取ることになるheightとの差
            const shrinkLength = target.height - collapsingHeightOfSection;
            // explorer領域のうちtarget stackとその上位のstackの占領している領域を引いて残った領域
            // NOTE: `restSpace`はdebug用の情報
            const restSpace =
                explorerHeight -
                target.height -
                sections.reduce((a, c) => {
                    if (c.index < stackIndex)
                        return (
                            a +
                            (c.collapse ? collapsingHeightOfSection : c.height)
                        );
                    else return a + 0;
                }, 0);
            const nextMaxConstraints = getMaxConstraints(
                sections.filter((section) => section.collapse).length - 1
            );

            // // DEBUG:
            // console.log(`shrink other stacks.`);
            // console.log(`shrinkLength: ${shrinkLength}`);
            // console.log(`restSpace: ${restSpace}`);

            // TODO
            let remainder = shrinkLength;

            // // DeBUG:
            // console.log(`remainder: ${remainder}`);

            if (target.height > nextMaxConstraints) {
                target.setHeight(nextMaxConstraints);
                remainder = shrinkLength - (target.height - nextMaxConstraints);
            }
            // collapse: falseであるsectionのうちheightが高い順に並び変えた
            const openingStacks = sections
                .filter((section) => !section.collapse)
                .sort(function (a, b) {
                    if (a.height < b.height) {
                        return 1;
                    } else if (a.height > b.height) {
                        return -1;
                    }
                    return 0;
                });

            // // DeBUG:
            // console.log(`remainder: ${remainder}`);

            openingStacks.every((stack) => {
                if (stack.height - remainder < _minConstraints) {
                    stack.setHeight(_minConstraints);
                    remainder = _minConstraints - (stack.height - remainder);
                    // // DEBUG:
                    // console.log(`shrink stack ${stack.index} to be ${_minConstraints}`);
                    // console.log(`remainder ${remainder}`);
                    return true;
                } else if (stack.height - remainder >= _minConstraints) {
                    stack.setHeight(stack.height - remainder);
                    remainder = 0;

                    // // DEBUG:
                    // console.log(
                    //   `shrink stack ${stack.index} to be ${stack.height - remainder}`
                    // );
                    // console.log(`remainder ${remainder}`);

                    return false;
                }
            });

            // console.log(
            //   `Is sum of each stack's height equal to explorer height? : ${
            //     0 +
            //     (collapseStackOne ? collapsingHeightOfSection : stackOneHeight) +
            //     (collapseStackTwo ? collapsingHeightOfSection : stackTwoHeight) +
            //     (collapseStackThree ? collapsingHeightOfSection : stackThreeHeight) +
            //     (collapseStackFour ? collapsingHeightOfSection : stackFourHeight)
            //   }`
            // );
        }
    };

    const onResizeStart = (
        e: React.SyntheticEvent,
        data: ResizeCallbackData,
        stackIndex: number
    ) => {
        // DEBUG:
        console.log(`on resize start: ${stackIndex}`);
        setDragging(stackIndex);
    };

    const onResizeStop = (
        e: React.SyntheticEvent,
        data: ResizeCallbackData,
        stackIndex: number
    ) => {
        // DEBUG:
        console.log(`on resize stop: ${stackIndex}`);
        setDragging(0);
    };

    // --- Calculation on every rendering ---

    /**
     * Present number of opening sections
     * */
    const currentNumberOfOpeningSections =
        numberOfStacks -
        [collapseStackOne, collapseStackTwo, collapseStackThree].filter(Boolean)
            .length;

    /**
     * Max constraints for each ResizableBox according to current number of opening stacks.
     * Passed to each stack's ResizableBox component.
     **/
    const maxConstraints = getMaxConstraints();

    /***
     * Height of each section.
     * Set stack's height collapsingHeightOfSection if the stack is collapsing.
     * */
    let _stackOneHeight = collapseStackOne
        ? collapsingHeightOfSection
        : stackOneHeight;
    let _stackTwoHeight = collapseStackTwo
        ? collapsingHeightOfSection
        : stackTwoHeight;
    let _stackThreeHeight = collapseStackThree
        ? collapsingHeightOfSection
        : stackThreeHeight;

    /***
     * Determine if a stack can be resized.
     * */
    let _stackOneAxis: iAxis = collapseStackOne ? 'none' : 'y';
    let _stackTwoAxis: iAxis = collapseStackTwo ? 'none' : 'y';
    let _stackThreeAxis: iAxis = collapseStackThree ? 'none' : 'y';

    /***
     * Disable resizing stack if openig stack is only one.
     * */
    if (currentNumberOfOpeningSections === 1) {
        const openingSection = [
            collapseStackOne,
            collapseStackTwo,
            collapseStackThree,
        ].indexOf(false);
        switch (openingSection) {
            case 0: {
                _stackOneHeight = maxConstraints;
                _stackOneAxis = 'none';
                break;
            }
            case 1: {
                _stackTwoHeight = maxConstraints;
                _stackTwoAxis = 'none';
                break;
            }
            case 2: {
                _stackThreeHeight = maxConstraints;
                _stackThreeAxis = 'none';
                break;
            }
        }
    }

    /***
     * Determine each stack's top position.
     * */
    const _stackOneTop = 0;
    const _stackTwoTop = _stackOneTop + _stackOneHeight;
    const _stackThreeTop = _stackTwoTop + _stackTwoHeight;

    /***
     * NOTE:
     * - react-resizale Resizableのhandleを表示するために、Resizable > divというペアは必須でなくてはならない
     *    つまり、Resizableの直接の子コンポーネントは組み込みコンポーネントでなくてはならないということ。
     *    カスタムコンポーネントはその組み込みコンポーネントの子コンポーネントとすること。
     *    custom-handleに関する説明は公式に載っていないに等しいのでこの通りの措置をとる。
     *
     * */
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                height: `${explorerHeight}px`,
                width: `${width}px`,
            }}
        >
            <div
                className="vscode-sidebar"
                style={{
                    width: `${width}px`,
                    height: '100%',
                }}
            >
                <div
                    style={{
                        height: `${_stackOneHeight}px`,
                        top: `${_stackOneTop}px`,
                        width: `${width}px`,
                        // DEBUG:
                        // backgroundColor: stackBackgruondColor.one,
                    }}
                >
                    <Resizable
                        className="custom-box box"
                        width={width}
                        height={_stackOneHeight}
                        handle={(h, ref) =>
                            _stackOneAxis !== 'none' ? (
                                <span
                                    className={`custom-handle custom-handle-${h}`}
                                    ref={ref}
                                />
                            ) : (
                                <span></span>
                            )
                        }
                        resizeHandles={['s']}
                        axis={_stackOneAxis}
                        minConstraints={[Infinity, _minConstraints]}
                        maxConstraints={[Infinity, maxConstraints]}
                        onResize={onResizeStackOne}
                        // onResize={(e, data) => onResizeStack(e, data, 1)}
                        onResizeStart={(e, data) => onResizeStart(e, data, 1)}
                        onResizeStop={(e, data) => onResizeStop(e, data, 1)}
                    >
                        <div
                            className="section"
                            style={{
                                height: '100%',
                                overflowY: 'hidden',
                            }}
                        >
                            <OpenEditor
                                id={1}
                                collapse={collapseStackOne}
                                height={stackOneHeight}
                                width={width}
                                onClick={(e) => handleSectionClick(e, 1)}
                            />
                        </div>
                    </Resizable>
                </div>
                <div
                    style={{
                        height: `${_stackTwoHeight}px`,
                        top: `${_stackTwoTop}px`,
                        width: `${width}px`,
                        // DEBUG:
                        // backgroundColor: stackBackgruondColor.two,
                    }}
                >
                    <Resizable
                        className="custom-box box"
                        width={width}
                        height={_stackTwoHeight}
                        handle={(h, ref) =>
                            _stackTwoAxis !== 'none' ? (
                                <span
                                    className={`custom-handle custom-handle-${h}`}
                                    ref={ref}
                                />
                            ) : (
                                <span></span>
                            )
                        }
                        resizeHandles={['s']}
                        axis={_stackTwoAxis}
                        minConstraints={[Infinity, _minConstraints]}
                        maxConstraints={[Infinity, maxConstraints]}
                        onResize={onResizeStackTwo}
                        // onResize={(e, data) => onResizeStack(e, data, 2)}
                        onResizeStart={(e, data) => onResizeStart(e, data, 2)}
                        onResizeStop={(e, data) => onResizeStop(e, data, 2)}
                    >
                        <div
                            className="section"
                            style={{
                                height: '100%',
                                overflowY: 'hidden',
                            }}
                        >
                            <VirtualFolder
                                id={2}
                                collapse={collapseStackTwo}
                                height={stackTwoHeight}
                                width={width}
                                onClick={(e) => handleSectionClick(e, 2)}
                            />
                        </div>
                    </Resizable>
                </div>
                <div
                    style={{
                        height: `${_stackThreeHeight}px`,
                        top: `${_stackThreeTop}px`,
                        width: `${width}px`,
                        // DEBUG:
                        // backgroundColor: stackBackgruondColor.three,
                    }}
                >
                    <Resizable
                        className="custom-box box"
                        width={width}
                        height={_stackThreeHeight}
                        handle={(h, ref) =>
                            _stackThreeAxis !== 'none' ? (
                                <span
                                    className={`custom-handle custom-handle-${h}`}
                                    ref={ref}
                                />
                            ) : (
                                <span></span>
                            )
                        }
                        resizeHandles={['s']}
                        axis={_stackThreeAxis}
                        minConstraints={[Infinity, _minConstraints]}
                        maxConstraints={[Infinity, maxConstraints]}
                        onResize={onResizeStackThree}
                        // onResize={(e, data) => onResizeStack(e, data, 3)}
                        onResizeStart={(e, data) => onResizeStart(e, data, 3)}
                        onResizeStop={(e, data) => onResizeStop(e, data, 3)}
                    >
                        <div
                            className="section"
                            style={{
                                height: '100%',
                                overflowY: 'hidden',
                            }}
                        >
                            <Dependencies
                                id={3}
                                collapse={collapseStackThree}
                                height={stackThreeHeight}
                                width={width}
                                onClick={(e) => handleSectionClick(e, 3)}
                            />
                        </div>
                    </Resizable>
                </div>
            </div>
        </div>
    );
};

export default VSCodeExplorer;
