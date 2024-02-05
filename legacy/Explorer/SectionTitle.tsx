import React from 'react';
// Icons
import chevronRight from '../../assets/chevron-right.svg';
import chevronDown from '../../assets/chevron-down.svg';

interface iProps {
    title: string;
    collapse: boolean;
    setCollapse: (param: boolean) => void;
    treeItemFunctions: (() => JSX.Element)[];
}

const SectionTitle = ({
    title,
    collapse,
    setCollapse,
    treeItemFunctions,
}: iProps) => {
    return (
        <div className="treeColumn sectionTitle">
            <div className="TreeItem" onClick={() => setCollapse(!collapse)}>
                <div className="treeColumn-icon-name">
                    {collapse ? (
                        <img src={chevronRight} alt="close section" />
                    ) : (
                        <img src={chevronDown} alt="open section" />
                    )}
                    <span className="treeColumn-icon-name--name">
                        {title.toUpperCase()}
                    </span>
                </div>
                <div className="TreeItem--function">
                    {collapse ? null : treeItemFunctions.map((tif) => tif())}
                </div>
            </div>
        </div>
    );
};

export default SectionTitle;
