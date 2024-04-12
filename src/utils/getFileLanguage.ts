import type { Language } from '../data/types';

// Returns language of passed path file.
// https://stackoverflow.com/a/190878
export const getFileLanguage = (path: string): Language | undefined => {
    if (path.includes('.')) {
        switch (path.split('.').pop()) {
            case 'js':
                return 'javascript';
            case 'jsx':
                return 'react';
            case 'ts':
                return 'typescript';
            case 'tsx':
                return 'react-typescript';
            case 'json':
                return 'json';
            case 'css':
                return 'css';
            case 'html':
                return 'html';
            case 'json':
                return 'json';
            case 'md':
                return 'markdown';
            default:
                return undefined;
        }
    }
    return undefined;
};
