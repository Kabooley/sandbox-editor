import React from 'react';
import './PixelLoading.css';

interface iProps {
    top: string;
    left: string;
    width: string;
    height: string;
}

export const PixelLoading = ({ top, left, width, height }: iProps) => {
    const _width = parseInt(width.split('px')[0]);
    const _height = parseInt(height.split('px')[0]);

    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        top: top,
        left: left,
        transform: 'translate(-50%, -50%)',
        width: width,
        height: height,
    };

    const pixelStyle: React.CSSProperties = {
        width: (_width / 3).toString() + 'px',
        height: (_height / 3).toString() + 'px',
    };

    return (
        <div className="pixel-loading--container" style={containerStyle}>
            <div
                id={'pixel-loading--id_0'}
                className="pixel-loading--pixel"
                style={pixelStyle}
            ></div>
            <div
                id={'pixel-loading--id_1'}
                className="pixel-loading--pixel"
                style={pixelStyle}
            ></div>
            <div
                id={'pixel-loading--id_2'}
                className="pixel-loading--pixel"
                style={pixelStyle}
            ></div>
            <div
                id={'pixel-loading--id_3'}
                className="pixel-loading--pixel"
                style={pixelStyle}
            ></div>
            <div
                id={'pixel-loading--id_4'}
                className="pixel-loading--pixel"
                style={pixelStyle}
            ></div>
            <div
                id={'pixel-loading--id_5'}
                className="pixel-loading--pixel"
                style={pixelStyle}
            ></div>
            <div
                id={'pixel-loading--id_6'}
                className="pixel-loading--pixel"
                style={pixelStyle}
            ></div>
            <div
                id={'pixel-loading--id_7'}
                className="pixel-loading--pixel"
                style={pixelStyle}
            ></div>
            <div
                id={'pixel-loading--id_8'}
                className="pixel-loading--pixel"
                style={pixelStyle}
            ></div>
        </div>
    );
};

// .editor-containerの直下に呼び出される
const LoadingEditor = () => {
    return (
        <>
            <PixelLoading
                top={'10%'}
                left={'50%'}
                width={'90px'}
                height={'90px'}
            />
        </>
    );
};

export default LoadingEditor;
