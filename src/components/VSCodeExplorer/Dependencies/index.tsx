import React from "react";
import Stack from "../Stack";
import Action from "../Action";
import Form from "./Form";
import trashIcon from "../../../assets/vscode/dark/trash.svg";
// import chevronRightIcon from "../../../assets/vscode/dark/chevron-right.svg";

interface iProps {
  id: number;
  collapse: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  height: number;
  width: number;
}

const dummyDependencies = [
  { name: "react", version: "17.0.2" },
  { name: "react-dom", version: "17.0.2" },
  { name: "axios", version: "^1.4.0" },
  { name: "localforage", version: "^1.10.0" },
  { name: "@types/react", version: "17.0.39" },
  { name: "prettier", version: "2.8.8" },
  { name: "tooMuchLongNameModule/suchAWaste", version: "9.9.9" },
];

const Dependencies: React.FC<iProps> = ({
  id,
  collapse,
  onClick,
  height,
  width,
}) => {
  const title = "dependencies";

  /***
   * - Validate value
   * - Check value is including version
   * https://github.com/codesandbox/codesandbox-client/blob/6494ed0d14573a92a6776cbb514fe5a7a8e8d3df/packages/app/src/app/pages/Sandbox/SearchDependencies/index.tsx
   * */
  const send = (value: string) => {
    if (!value.length) return;

    // TODO: validator
    let version = "latest";
    const isScoped = value.startsWith("@");
    const splittedName = value.split("@");
    if (splittedName.length > (isScoped ? 2 : 1)) {
      version = splittedName.pop() as string;
    }
    const dependencyName = splittedName.join(`@`);

    // NOTE: omit fetching module functions.
  };

  const renderActionDeleteDependency = (dependency: {
    name: string;
    version: string;
  }) => {
    const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
      e.stopPropagation();
      // TODO: implement handler
    };
    return (
      <Action
        handler={clickHandler}
        icon={trashIcon}
        altMessage="Delete dependency permanently"
      />
    );
  };

  const nestDepth = 1;

  return (
    <Stack
      id={id}
      title={title}
      collapse={collapse}
      onClick={onClick}
      height={height}
      width={width}
      actions={[]}
    >
      <Form send={send} />
      {dummyDependencies.map((dd, index) => (
        <div className="stack-body-list__item dependencies" key={index}>
          <div
            className="indent"
            style={{ paddingLeft: `${nestDepth * 1.6}rem` }}
          ></div>
          <h3 className="item-label">{dd.name}</h3>
          <span>{dd.version}</span>
          <div
            className="indent"
            style={{ paddingLeft: `${nestDepth * 1.6}rem` }}
          ></div>
          <div className="actions hover-to-appear">
            <div className="actions-bar">
              <ul className="actions-container">
                {renderActionDeleteDependency(dd)}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </Stack>
  );
};

export default Dependencies;
