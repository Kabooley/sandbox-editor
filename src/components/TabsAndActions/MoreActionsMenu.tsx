import React, { useRef } from 'react';
import { useClickOutside } from '../../hooks';

interface iProps {
    menuItems: {
        title: string;
        handleClick: () => void;
    }[];
    x: number;
    y: number;
    hideMenu: (flag: boolean) => void;
}

/***
 *
 * TODO: 別件だけどpreview toggleのアイコンが逆である
 *
 * */
export const MoreActionsMenu = ({ menuItems, x, y, hideMenu }: iProps) => {
    const refMenu = useRef<HTMLElement>(null);
    useClickOutside(refMenu, () => {
        hideMenu(false);
    });

    const handleClick = (
        e: React.MouseEvent<HTMLDivElement>,
        callback: () => void
    ) => {
        e.preventDefault();
        e.stopPropagation();
        callback();
    };

    const fixedPosition: React.CSSProperties = {
        top: `${y}px`,
        left: `${x - 100}px`,
    };

    return (
        <nav
            className="more-actions--menu fade-in"
            role="menu"
            style={fixedPosition}
            tabIndex={-1}
            ref={refMenu}
        >
            {menuItems.map((mi, index) => (
                <div
                    key={index}
                    className="menu-item"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={(e) => handleClick(e, mi.handleClick)}
                >
                    {mi.title}
                </div>
            ))}
        </nav>
    );
};
