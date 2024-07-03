import React from 'react';
import Stack from '../VSCodeExplorer/Stack';
import { SkeletonExplorerStackBody } from './SkeletonExplorerStackBody';

interface iProps {
    width: number;
    height: number;
}


const collapsingHeightOfSection = 24;

/***
 * VSCodeExplorerを模したスケルトンを生成する
 *
 * */
const SkeletonExplorer = ({ width, height }: iProps) => {
    const _stackOneHeight = collapsingHeightOfSection;
    const _stackTwoHeight = height * 0.5;
    const _stackThreeHeight = height - _stackOneHeight - _stackTwoHeight;
    const _stackOneTop = 0;
    const _stackTwoTop = _stackOneTop + _stackOneHeight;
    const _stackThreeTop = _stackTwoTop + _stackTwoHeight;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                height: `${height}px`,
                width: `${width}px`,
            }}
        >
            <div
                className="vscode-sidebar"
                style={{
                    width: `${width}px`,
                    height: '100%',
                }}
            >
                {/* ----- */}
                <div
                    style={{
                        height: `${_stackOneHeight}px`,
                        top: `${_stackOneTop}px`,
                        width: `${width}px`,
                        // DEBUG:
                        // backgroundColor: stackBackgruondColor.one,
                    }}
                >
                    <div
                        className="section"
                        style={{
                            height: '100%',
                            overflowY: 'hidden',
                        }}
                    >
                        <Stack
                            id={1}
                            title={'openeditor'}
                            collapse={true}
                            onClick={() => {}}
                            height={height}
                            width={width}
                            actions={[]}
                        >
                            {null}
                        </Stack>
                    </div>
                </div>
                {/* ----- */}
                <div
                    style={{
                        height: `${_stackTwoHeight}px`,
                        top: `${_stackTwoTop}px`,
                        width: `${width}px`,
                        // DEBUG:
                        // backgroundColor: stackBackgruondColor.two,
                    }}
                >
                    <div
                        className="section"
                        style={{
                            height: '100%',
                            overflowY: 'hidden',
                        }}
                    >
                        <Stack
                            id={2}
                            title={'workspace'}
                            collapse={false}
                            onClick={() => {}}
                            height={height}
                            width={width}
                            actions={[]}
                        >
                            <SkeletonExplorerStackBody />
                        </Stack>
                    </div>
                </div>
                <div
                    style={{
                        height: `${_stackThreeHeight}px`,
                        top: `${_stackThreeTop}px`,
                        width: `${width}px`,
                        // DEBUG:
                        // backgroundColor: stackBackgruondColor.three,
                    }}
                >
                    <div
                        className="section"
                        style={{
                            height: '100%',
                            overflowY: 'hidden',
                        }}
                    >
                        <Stack
                            id={3}
                            title={'dependencies'}
                            collapse={false}
                            onClick={() => {}}
                            height={height}
                            width={width}
                            actions={[]}
                        >
                            <SkeletonExplorerStackBody />
                        </Stack>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonExplorer;
