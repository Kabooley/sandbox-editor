import React from 'react';

interface iProps {
  children: any;
}

const MainContainer = ({ children }: iProps): React.JSX.Element => {
  return <div className="main-container">{children}</div>;
};

export default MainContainer;