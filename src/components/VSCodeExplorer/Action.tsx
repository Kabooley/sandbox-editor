import React from 'react';

interface iProps {
    handler: (e: React.MouseEvent<HTMLLIElement>) => void;
    icon: any;
    altMessage: string;
}

const Action: React.FC<iProps> = ({ handler, icon }) => {
    return (
        <li className="action-item" onClick={handler}>
            <img className="codicon" src={icon} alt="" />
        </li>
    );
};

export default Action;
