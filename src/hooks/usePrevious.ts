import React, { useEffect, useRef } from 'react';

/**
 * https://legacy.reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 *
 *
 * */
export const usePrevious = <T>(val: T): T | undefined => {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = val;
    });

    return ref.current;
};
