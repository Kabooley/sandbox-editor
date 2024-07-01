import React from 'react';
import { SkeletonRoundIcon } from './SkeletonRoundIcon';
import { SkeletonSquareIcon } from './SkeletonIconSquare';
import { SkeletonTextBlock } from './SkeletonTextBlock';

export const SkeletonExplorerStackBody = () => {
    return (
        <ul className="list">
            <li className="list-item horizontal space-both-side">
                <SkeletonSquareIcon />
                <SkeletonTextBlock />
            </li>
            <li className="list-item horizontal space-both-side">
                <SkeletonSquareIcon />
                <SkeletonTextBlock />
            </li>
            <li className="list-item horizontal space-both-side">
                <SkeletonSquareIcon />
                <SkeletonTextBlock />
            </li>
            <li className="list-item horizontal space-both-side">
                <SkeletonRoundIcon />
                <SkeletonTextBlock />
            </li>
            <li className="list-item horizontal space-both-side">
                <SkeletonRoundIcon />
                <SkeletonTextBlock />
            </li>
            <li className="list-item horizontal space-both-side">
                <SkeletonRoundIcon />
                <SkeletonTextBlock />
            </li>
        </ul>
    );
};
