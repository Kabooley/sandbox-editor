/**************************************************************
 * https://github.com/codesandbox/codesandbox-client/blob/5f61507f955f923c0518e5ad894bc1228a25c1b4/packages/components/src/components/Stack/index.tsx
 * 
 * TODO: `.stack`に`'> *:not(:last-child)': {
      [direction === 'horizontal' ? 'marginRight' : 'marginBottom']: gap`
      を追加して
 * ************************************************************/
import React from 'react';

interface iStackProps {
    gap?: number; // theme.space token
    direction?: 'horizontal' | 'vertical';
    justify?: React.CSSProperties['justifyContent'];
    align?: React.CSSProperties['alignItems'];
    inline?: boolean;
    wrap?: boolean;
    children: React.ReactElement;
}

export const Stack = ({
    gap = 0,
    direction = 'horizontal',
    justify,
    align,
    inline,
    wrap,
    children,
}: iStackProps) => {
    const className = [
        'stack',
        direction === 'horizontal' ? 'marginRight' : 'marginBottom',
    ].join(' ');
    return (
        <div
            className={className}
            style={{
                display: inline ? 'inline-flex' : 'flex',
                flexDirection: direction === 'horizontal' ? 'row' : 'column',
                justifyContent: justify,
                alignItems: align,
                flexWrap: wrap ? 'wrap' : 'nowrap',
            }}
        >
            {children}
        </div>
    );
};
