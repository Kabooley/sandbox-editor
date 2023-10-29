import React, { useState } from 'react';

const SideBar = () => {
    const [showPrompt, setShowPrompt] = useState<boolean>(false);

    const handleClick = () => {
        setShowPrompt(!showPrompt);
    };

    return (
        <div className="side-bar">
            <div className={showPrompt ? 'prompt show' : 'prompt'}>prompt</div>
            <button className="toggle-prompt" onClick={handleClick}>
                status bar and toggele prompt
            </button>
        </div>
    );
};

export default SideBar;
