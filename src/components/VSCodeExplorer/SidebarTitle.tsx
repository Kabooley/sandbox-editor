import React from 'react';

interface iProps {
    width: number;
    title: string;
}

const SidebarTitle: React.FC<iProps> = ({ width, title }) => {
    return (
        <div
            className="sidebar-title-container"
            style={{
                width: width,
            }}
        >
            <div className="title-label">
                <h2>{title.toUpperCase()}</h2>
            </div>
            <div className="title-actions">
                <div className="actions-container"></div>
            </div>
        </div>
    );
};

export default SidebarTitle;
