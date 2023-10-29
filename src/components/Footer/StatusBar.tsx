import React from 'react';

const StatusBar = () => {
    return (
        <div className="status-bar">
            <div className="status-bar-item">
                <div>
                    <div
                        className="status-bar-item__editor-status"
                        title="prettier-format"
                    >
                        <button title="prettier-format">Prettier</button>
                    </div>
                    <div
                        className="status-bar-item__editor-status"
                        title="Go to line"
                    >
                        Ln 11, Col 49
                    </div>
                    <div
                        className="status-bar-item__editor-status"
                        title="Select indentation"
                    >
                        Spaces: 2
                    </div>
                    <div
                        className="status-bar-item__editor-status"
                        title="Language mode"
                    >
                        TypeScript
                    </div>
                    <div
                        className="status-bar-item__editor-status"
                        title="Toggle preview"
                    >
                        <label className="toggle-switch">
                            <span>Preview</span>
                            <span className="toggle-switch__slider"></span>
                            <input type="checkbox" />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
