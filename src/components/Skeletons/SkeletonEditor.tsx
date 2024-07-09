import React from 'react';
import { SkeletonTextBlock } from './SkeletonTextBlock';

/***
 * https://github.com/codesandbox/codesandbox-client/blob/cd173e522470dd7f6e4e6bcc138aea8b6a90265a/packages/app/src/app/pages/Sandbox/Editor/Skeleton/elements.ts
 *
 *
 * **/
const EditorSkeleton = () => {
  return (
    <div className="skeleton--editor-container">
      <ul className="list">
        <li className="list-item horizontal indent-left-32">
          <SkeletonTextBlock />
        </li>
        <li className="list-item horizontal indent-left-32">
          <SkeletonTextBlock />
        </li>
        <li className="list-item horizontal indent-left-32">
          <SkeletonTextBlock />
        </li>
        <li className="list-item horizontal indent-left-32">
          <SkeletonTextBlock />
        </li>
        <li className="list-item horizontal indent-left-32">
          <SkeletonTextBlock />
        </li>
        <li className="list-item horizontal indent-left-32">
          <SkeletonTextBlock />
        </li>
        <li className="list-item horizontal indent-left-32">
          <SkeletonTextBlock />
        </li>
        <li className="list-item horizontal indent-left-32">
          <SkeletonTextBlock />
        </li>
      </ul>
    </div>
  );
};

export default EditorSkeleton;
