import React from 'react';

import chevronRigthIcon from '../../assets/vscode/dark/chevron-right.svg';
import chevronDownIcon from '../../assets/vscode/dark/chevron-down.svg';

interface iProps {
    id: number;
    title: string;
    actions: (() => React.ReactNode)[];
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    collapse: boolean;
}

const PaneHeader: React.FC<iProps> = ({
    id,
    title,
    actions,
    onClick,
    collapse,
}) => {
    const actionClassNames = collapse ? 'actions' : 'display actions';
    return (
        <div className="pane-header" onClick={onClick}>
            <div className="codicon">
                {collapse ? (
                    <img src={chevronRigthIcon} alt="" />
                ) : (
                    <img src={chevronDownIcon} alt="" />
                )}
            </div>
            <h3>{title}</h3>
            <div className={actionClassNames}>
                <div className="actions-bar">
                    <ul className="actions-container">
                        {actions.map((action) => action())}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PaneHeader;
