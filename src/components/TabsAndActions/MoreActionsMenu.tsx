import React, { useRef } from 'react';
import { useClickOutside } from '../../hooks';

interface iProps {
    menuItems: {
        title: string;
        handleClick: () => void;
    }[];
}

// TODO:
// 他の要素がクリックされたら自動的に消えるようにする
// どの座標に出現させるのか座標を取得する機能
export const MoreActionsMenu = ({ menuItems }: iProps) => {
    const refMenu = useRef<HTMLElement>(null);
    useClickOutside(refMenu, (event) => {
        
    })
    

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
        top: '',
        left: '',
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
