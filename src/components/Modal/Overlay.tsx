import React from "react";

interface iProps {
  children: any;
  className?: string;
  handleClick: () => void;
  // style?: React.CSSProperties;
}

const Overlay: React.FC<iProps> = ({
  children,
  className,
  handleClick,
  // style,
}) => {
  const _className =
    className !== undefined ? ["overlay", className].join(" ") : "overlay";
  // const _style = {
  //   ...defaultStyle,
  //   ...style,
  // };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof handleClick === "function") {
      handleClick();
    }
  };

  return (
    <div
      // style={{ ..._style }}
      className={_className}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Overlay;
