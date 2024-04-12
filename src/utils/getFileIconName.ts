import { getFileType } from './getFileType';

export const getFileIconName = (path: string) => {
    let iconName = getFileType(path);
    if (iconName === undefined) {
        iconName = 'blank-file';
    }
    return iconName;
};
