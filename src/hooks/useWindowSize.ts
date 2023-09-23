import React, { useState, useEffect, useRef } from 'react';

const defaultDelay = 500;

/***
 * Returns window.innerWidth and window.innerHeight when timer reached to delay time.
 * While every resize event which does not reached delay time, that event will be ignored.
 * */
export const useWindowSize = () => {
    const [innerWidth, setInnerWidth] = useState<number>(window.innerWidth);
    const [innerHeight, setInnerHeight] = useState<number>(window.innerHeight);
    const timer = useRef<any>();

    useEffect(() => {
        // This might always undefined because it's not save value while re-render.
        // let timer: any;
        const onWindowResizeHandler = () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
            timer.current = setTimeout(() => {
                setInnerWidth(window.innerWidth);
                setInnerHeight(window.innerHeight);
            }, defaultDelay);
        };

        window.addEventListener('resize', onWindowResizeHandler);

        return () => {
            window.removeEventListener('resize', onWindowResizeHandler);
        };
    }, []);

    return {
        innerWidth,
        innerHeight,
    };
};
