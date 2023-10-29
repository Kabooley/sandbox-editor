import React from "react";

interface iProps {
  key: number;
  handleClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  title: string;
  version: string;
}

const styleOfTreeItem: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  padding: "2px 0 2px"
};

const Column = ({ key, handleClick, title, version }: iProps) => {
  return (
    <div className="treeColumn" key={key} onClick={handleClick}>
      <div className="TreeItem" style={styleOfTreeItem}>
        <div
          style={{
            maxWidth: "70%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: "30%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          <span>{version}</span>
        </div>
      </div>
    </div>
  );
};

export default Column;
