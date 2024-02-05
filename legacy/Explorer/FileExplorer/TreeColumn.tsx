import React from 'react';
import { iExplorer } from '../../../data/types';
import TreeColumnIconName from './TreeColumnIconName';

// iExplorerのいくつかをオプショナルにしたやつ
// interface iTreeData {
//     path: string;
//     name?: string;
//     isFolder?: boolean;
//     items?: iTreeData[];
// };

interface iProps {
    nestDepth: number;
    explorer: iExplorer;
    treeItemFunctions: (() => JSX.Element)[];
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const TreeColumn = ({
    nestDepth,
    explorer,
    treeItemFunctions,
    onClick,
}: iProps) => {
    return (
        <div
            className="treeColumn"
            style={{ paddingLeft: `${nestDepth * 2.4}rem` }}
            key={explorer.name}
            onClick={onClick}
        >
            <div className="TreeItem">
                <TreeColumnIconName explorer={explorer} />
                <div className="TreeItem--function">
                    {treeItemFunctions.map((tif) => tif())}
                </div>
            </div>
        </div>
    );
};

export default TreeColumn;
