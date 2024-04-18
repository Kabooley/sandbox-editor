import React from 'react';
import { mdiArrowCollapseLeft, mdiArrowCollapseRight } from '@mdi/js';
import Icon from '@mdi/react';

interface iProps {
    isCollapsing: boolean;
    size?: string;
    color?: string;
}

export const CollapseIcon = ({
    isCollapsing,
    size = '16px',
    color = 'currentColor',
}: iProps) => {
    const path = isCollapsing ? mdiArrowCollapseLeft : mdiArrowCollapseRight;
    return (
        <>
            <Icon
                path={path}
                size={size}
                color={color}
                title={'toggle preview'}
            />
        </>
    );
};
