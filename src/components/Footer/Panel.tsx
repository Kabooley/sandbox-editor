// https://github.com/expo/snack/blob/f8201851c898cccf51ae1943c718a4b1f1f6f0d6/website/src/client/components/EditorPanels.tsx#L22
//
// 関係ないけど自作Resizableコンポーネントの参考に: https://github.com/expo/snack/blob/f8201851c898cccf51ae1943c718a4b1f1f6f0d6/website/src/client/components/shared/ResizablePane.tsx
import React, { useState, useRef, useEffect } from "react";
import { Resizable } from "react-resizable";
import type { ResizeCallbackData } from "react-resizable";
import ErrorPanel from "./ErrorPanel";

// ---

export enum AnnotationSeverity {
  LOADING = -1,
  IGNORE = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  FATAL = 4,
}

export type AnnotationAction = {
  title: string;
  icon?: React.ComponentType<any>;
  run: () => void;
};

export type AnnotationLocation = {
  fileName: string;
  startLineNumber: number;
  endLineNumber: number;
  startColumn: number;
  endColumn: number;
};

export type Annotation = {
  message: string;
  severity: AnnotationSeverity;
  source: "Device" | "Web" | "JSON" | "ESLint" | "Dependencies";
  location?: AnnotationLocation;
  action?: AnnotationAction;
};

// ---

interface iProps {
  panelType: "errors" | "logs";
  annotations: Annotation[];
}

const Panel: React.FC<iProps> = ({ panelType = "errors" }) => {
  const [panelHeight, setPanelHeight] = useState<number>(200);
  const refThisPanelContent = useRef<HTMLDivElement>(null);
  const maxConstraints = window.innerHeight * 0.8;

  const onPanleResize: (
    e: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => any = (event, { node, size, handle }) => {
    setPanelHeight(size.height);
  };

  return (
    <Resizable
      width={Infinity}
      height={panelHeight}
      onResize={onPanleResize}
      minConstraints={[Infinity, 100]}
      maxConstraints={[Infinity, maxConstraints]}
      resizeHandles={["n"]}
      handle={(h, ref) => (
        <span className={`custom-handle custom-handle-${h}`} ref={ref} />
      )}
    >
      <div className="panel-contianer">
        <div className="panel-upper">
          <div className="panel-actions">{/* add action here. */}</div>
        </div>
        <div ref={refThisPanelContent} className="panel-content">
          {panelType === "errors" ? (
            <ProblemsPanel
              annotations={annotations}
              onSelectFile={onSelectFile}
            />
          ) : null}
          {/* {panelType === "logs" ? (
            <EditorPanelLogs deviceLogs={deviceLogs} />
          ) : null} */}
        </div>
      </div>
    </Resizable>
  );
};

export default Panel;
