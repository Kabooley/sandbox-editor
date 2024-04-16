import React, { useState, useRef, useEffect } from 'react';

interface iProps {
    refTarget: React.RefObject<HTMLElement | null>;
    onClickOutside: (e: MouseEvent) => void;
}

/***
 * https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
 * https://github.com/streamich/react-use/blob/master/docs/useClickAway.md
 *
 * refを渡している要素の外をクリックしたときに実行するcallbackを渡す
 *
 * 呼び出し側は監視したい要素へrefを渡す必要がある
 * */
export const useClickOutside = ({ refTarget, onClickOutside }: iProps) => {
    const savedCallback = useRef(onClickOutside);

    useEffect(() => {
        savedCallback.current = onClickOutside;
    }, [onClickOutside]);

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            const { current: el } = refTarget;
            // ref.currentがundefinedでない、かつイベントトリガー要素を含んでいるとき
            // callbackを実行する
            el && !el.contains(event.target) && savedCallback.current(event);
        };
        document.addEventListener('click', handler, false);
        return () => {
            document.removeEventListener('click', handler, false);
        };
    }, [refTarget]);
};
