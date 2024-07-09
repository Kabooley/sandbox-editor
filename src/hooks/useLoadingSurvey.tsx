import React, { useEffect } from 'react';

/***
 * For debug purpose only.
 *
 * */
export const useLoadingSurvey = (
    name: string,
    disableEverytimeEffect: boolean = false,
    ...trigger: any[]
) => {
    useEffect(() => {
        if (!disableEverytimeEffect) {
            // DEBUG:
            console.log(`[rerendered] ${name}`);
        }
    });

    useEffect(() => {
        // DEBUG:
        console.log(`[rerendered by trigger] ${name}`);
    }, [...trigger]);
};
