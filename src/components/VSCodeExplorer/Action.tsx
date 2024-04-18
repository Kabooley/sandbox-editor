import React from 'react';

interface iProps {
    handler: (e: React.MouseEvent<HTMLLIElement>) => void;
    icon: any;
    altMessage: string;
    additionalClassNames?: string[];
    children?: React.ReactElement;
}

const Action: React.FC<iProps> = ({
    handler,
    icon,
    altMessage,
    additionalClassNames = [],
    children,
}) => {
    const classNames = ['action-item', ...additionalClassNames].join(' ');
    if (children === undefined) {
        return (
            <li className={classNames} onClick={handler}>
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
            <li className={classNames} onClick={handler}>
                {children}
            </li>
        );
    }
};

export default Action;
