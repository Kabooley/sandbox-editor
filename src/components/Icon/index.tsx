/***********************************************************************************
 * Pictgrammers material design icons
 *
 * https://github.com/Templarian/MaterialDesign-React#readme
 *
 * https://pictogrammers.com/docs/library/mdi/getting-started/react/
 *
 * Iconコンポーネントのpathプロパティに`@mdi/js`の中のアイコン名称を与えることで
 * ほしいiconを返してくれる
 * 名称は自分で`mdi.d.ts`の中から探して。
 *
 * colorとかscaleとか自由に変更できる一方決めるのが面倒くさかったりする
 *
 * 色のテーマはここを参考にする
 *
 * https://github.com/PKief/vscode-material-icon-theme/tree/main
 *
 * *********************************************************************************/
import React from 'react';
import { Icon as MDIcon } from '@mdi/react';
import {
    mdiLanguageTypescript,
    mdiLanguageJavascript,
    mdiLanguageCss3,
    mdiLanguageHtml5,
    mdiLanguageMarkdown,
    mdiCodeJson,
    mdiReact,
    mdiFileImage,
    mdiSvg,
    mdiFolder,
    mdiFile,
} from '@mdi/js';
import type { FileTypes } from "../../data/types";

const iconList: {
    //   [name in iIconNames]: {
    // [name: string]: {
    [name in FileTypes]: {
        path: string;
        title: string;
        size: string;
        color: string;
    };
} = {
    typescript: {
        path: mdiLanguageTypescript,
        title: 'typescript',
        size: '16px',
        color: '#0288d1',
    },
    javascript: {
        path: mdiLanguageJavascript,
        title: 'javascript',
        size: '16px',
        color: '#ffca28',
    },
    css: {
        path: mdiLanguageCss3,
        title: 'css3',
        size: '16px',
        color: '#42a5f5',
    },
    html: {
        path: mdiLanguageHtml5,
        title: 'html5',
        size: '16px',
        color: '#e44d26',
    },
    markdown: {
        path: mdiLanguageMarkdown,
        title: 'markdown',
        size: '16px',
        color: '#EA7130',
    },
    json: { path: mdiCodeJson, title: 'json', size: '16px', color: '#92AA5D' },
    'react-typescript': { path: mdiReact, title: 'react', size: '24px', color: '#00bcd4' },
    react: { path: mdiReact, title: 'react', size: '24px', color: '#00bcd4' },
    image: {
        path: mdiFileImage,
        title: 'image',
        size: '16px',
        color: '#26a69f',
    },
    svg: { path: mdiSvg, title: 'svg', size: '32px', color: '#ffb300' },
    folder: {
        path: mdiFolder,
        title: 'folder',
        size: '16px',
        color: 'currentColor',
    },
    // ブランクファイル
    'blank-file': {
        path: mdiFile,
        title: 'file',
        size: '16px',
        color: 'currentColor',
    },
};

type iIconNames =
    | 'typescript'
    | 'javascript'
    | 'html'
    | 'css'
    | 'react'
    | 'react-typescript'
    | 'image'
    | 'svg'
    | 'folder'
    | 'markdown'
    | 'json'
    | 'blank-file';

interface iProps {
    name: FileTypes;
    size?: string;
}

export const Icon = ({ name, size }: iProps) => {
    const template = iconList[name];
    const _size = size === undefined ? template.size : size;
    return (
        <>
            <MDIcon
                path={template.path}
                title={template.title}
                size={_size}
                color={template.color}
            />
        </>
    );
};
