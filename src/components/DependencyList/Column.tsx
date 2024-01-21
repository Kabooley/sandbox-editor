import React from 'react';
// import closeButton from '../../../assets/close-button.svg';
import closeButton from '../../assets/close-button.svg';

interface iProps {
    key: number;
    handleClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleRemove: (moduleName: string, version: string) => void;
    title: string;
    version: string;
}

const styleOfTreeItem: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    flex: 'nowrap',
    padding: '2px 0 2px',
    position: 'relative',
    cursor: 'pointer',
    overflowX: 'hidden',
};

const Column = ({ key, handleClick, title, version, handleRemove }: iProps) => {
    const onDelete = (title: string, version: string) => {
        // TODO: call delete method from parent.
        handleRemove(title, version);
    };

    return (
        <div className="treeColumn" key={key} onClick={handleClick}>
            <div className="depedency-list-tree-item">
                <div
                    style={{
                        maxWidth: '70%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        width: '30%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <span>{version}</span>
                </div>
                {/* TODO: ホバーしたら表示するようにする */}
                {/* <div className="TreeItem--function"> */}
                <div
                    style={{
                        position: 'absolute',
                        right: '0',
                        top: '0px',
                        opacity: '0',
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'row',
                    }}
                    className="dependency-list-column-functions"
                >
                    <div onClick={() => onDelete(title, version)}>
                        <img src={closeButton} alt="delete folder" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Column;
