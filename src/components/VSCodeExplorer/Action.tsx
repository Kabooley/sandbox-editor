import React from 'react';

interface iProps {
    handler: (e: React.MouseEvent<HTMLLIElement>) => void;
    icon: any;
    altMessage: string;
    children?: React.ReactElement;
}

const Action: React.FC<iProps> = ({ handler, icon, altMessage, children }) => {
    if (children === undefined) {
        return (
            <li className="action-item" onClick={handler}>
                <img
                    className="codicon"
                    src={icon}
                    alt={altMessage}
                    title={altMessage}
                />
            </li>
        );
    } else {
        return (
            <li className="action-item" onClick={handler}>
                {children}
            </li>
        );
    }
};

export default Action;
