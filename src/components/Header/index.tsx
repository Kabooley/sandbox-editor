import React from 'react';
import menu from '../../assets/menu.svg';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectLayoutState, layoutActions } from '../../slices/layoutSlice';

// const $IconSize = '24px';

const Header = (): JSX.Element => {
    const { paneWidth, isSidebarDisplay } = useAppSelector(selectLayoutState);
    const dispatch = useAppDispatch();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(layoutActions.ToggleSidebar());
    };

    return (
        <div className="header-section">
            <nav>
                <div className="header-section nav--item">
                    <button onClick={handleClick}>
                        <img src={menu} />
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Header;
