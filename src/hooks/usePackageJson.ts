// import React from 'react';
// import type { File } from '../data/files';
// import { useFiles } from '../context/FilesContext';
// import { getFilenameFromPath } from '../utils';


// // FilesContextのProviderで囲われているコンポーネントからなら多分呼び出せるはず
// export function usePackageJson() {
//     const files = useFiles();
//     const packageJson: File | undefined = files.find(f => getFilenameFromPath(f.getPath()) === 'package.json');
//     return packageJson || {} as File;
// };

