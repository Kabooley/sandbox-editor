import React from 'react';
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
                <SkeletonSquareIcon />
                <SkeletonTextBlock />
            </li>
            <li className="list-item horizontal space-both-side">
                <SkeletonSquareIcon />
                <SkeletonTextBlock />
            </li>
        </ul>
    );
};
