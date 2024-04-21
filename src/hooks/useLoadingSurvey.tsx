import React, { useState, useEffect, useRef } from 'react';

interface iProps {
    trigger: any[];
    name: string;
    disableEverytimeEffect?: boolean;
}

/***
 * For debug purpose only.
 *
 * */
export const useLoadingSurvey = ({
    trigger,
    name,
    disableEverytimeEffect = false,
}: iProps) => {
    useEffect(() => {
        if (!disableEverytimeEffect) {
            // DEBUG:
            console.log(`[update] ${name}`);
        }
    });

    useEffect(() => {
        // DEBUG:
        console.log(`[updated by trigger] ${name}`);
    }, [...trigger]);
};
