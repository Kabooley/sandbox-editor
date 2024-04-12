import type { FileTypes } from '../data/types';
import { getFileLanguage } from './getFileLanguage';

// Returns type of passed path file.
// https://stackoverflow.com/a/190878
export const getFileType = (path: string): FileTypes | undefined => {
    if (path.includes('.')) {
        switch (path.split('.').pop()) {
            case 'png':
            case 'jpeg':
            case 'jpg':
                return 'image';
            case 'svg':
                return 'svg';
            default: {
                return getFileLanguage(path);
            }
        }
    }
    return undefined;
};
