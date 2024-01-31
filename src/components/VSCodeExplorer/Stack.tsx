import React from "react";
import PaneHeader from "./PaneHeader";
import ScrollableElement from "../ScrollableElement";

interface iProps {
  // stack id in parent component
  id: number;
  // title of this stack
  title: string;
  // Status of collapse/expand stack body.
  collapse: boolean;
  // Height of stack.
  height: number;
  // Width of stack.
  width: number;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  // Action functions for this stack header.
  actions: (() => React.ReactNode)[];
  // // Item list of this stack's body.
  // listItems: iStackBodyItem[];
  children: any;
}

// According to sass/components/_pane.scss
const heightOfPaneHeader = 24;

const Stack: React.FC<iProps> = ({
  id,
  title,
  collapse,
  height,
  width,
  onClick,
  actions,
  children,
}) => {
  // const indent = "16px";
  const collapsibleContentHeight = height - heightOfPaneHeader;

  return (
    <div className="stack">
      <PaneHeader
        id={id}
        title={title}
        actions={[...actions]}
        onClick={onClick}
        collapse={collapse}
      />
      <div className={collapse ? "collapsible collapse" : "collapsible"}>
        <ScrollableElement
          width={width}
          height={collapsibleContentHeight}
          disableHorizontalScrollbar={true}
          optionalStyles={{
            verticalScrollbarThumbWidth: width * 0.05,
          }}
          onChildrenResizeEvent={height}
        >
          <div className="stack-body-list" style={{ width: `${width}px` }}>
            {/* -- prototype of stack body list item -- */}
            {/* {listItems.map((item, index) => (
            <div className="stack-body-list__item" key={index}>
              <div className="indent" style={{ width: indent }}></div>
              <div className="codicon">
                <img src={chevronRightIcon} />
              </div>
              <h3 className="item-label">{item.title}</h3>
              <div className="actions hover-to-appear">
                <div className="actions-bar">
                  <ul className="actions-container">
                    {item.actions.map((action) => action())}
                  </ul>
                </div>
              </div>
            </div>
          ))} */}
            {children}
          </div>
        </ScrollableElement>
      </div>
    </div>
  );
};

export default Stack;
