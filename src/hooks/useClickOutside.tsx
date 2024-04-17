import React, { useRef, useEffect } from 'react';

/***
 * Runs callback when click event outside of referencing dom.
 *
 * @param {React.RefObject<HTMLElement | null>} refTarget -
 * @param {(e: MouseEvent) => void} onClickOutside -
 *
 * reference:
 * https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
 * https://github.com/streamich/react-use/blob/master/docs/useClickAway.md
 *
 * */
export const useClickOutside = (
    refTarget: React.RefObject<HTMLElement | null>,
    onClickOutside: (e: MouseEvent) => void
) => {
    const savedCallback = useRef(onClickOutside);

    useEffect(() => {
        savedCallback.current = onClickOutside;
    }, [onClickOutside]);

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            const { current: el } = refTarget;
            // ref.currentがundefinedでない、かつイベントトリガー要素を含んでいるとき
            // callbackを実行する
            el &&
                !el.contains(event.target as Node) &&
                savedCallback.current(event);
        };
        document.addEventListener('click', handler, false);
        return () => {
            document.removeEventListener('click', handler, false);
        };
    }, [refTarget]);
};
