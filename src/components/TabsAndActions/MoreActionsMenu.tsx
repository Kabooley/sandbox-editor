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
 * TODO: styleをcssに移す
 * TODO: backgroundカラー
 * TODO: menu-itemのホバースタイル, カラーはcppinkで
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

    const styleOfNav: React.CSSProperties = {
        position: 'fixed',
        opacity: '1',
        top: `${y}px`,
        left: `${x - 100}px`,
        backgroundColor: 'red',
        padding: '12px 24px',
        zIndex: '10',
        display: 'flex',
        fontSize: '13px',
        fontWeight: '400',
        lineHeight: '1.2307',
    };

    return (
        <nav
            className="more-actions--menu"
            role="menu"
            style={styleOfNav}
            tabIndex={-1}
            ref={refMenu}
        >
            {menuItems.map((mi) => (
                <div
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
