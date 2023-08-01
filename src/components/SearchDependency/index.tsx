/***
 * https://github.com/codesandbox/codesandbox-client/blob/9a75ddff1312faaf9fcd3f7f8a019de0f464ab47/packages/app/src/app/pages/Sandbox/SearchDependencies/index.tsx
 * 
 * */ 
import React from 'react';


const SerchDependency = () => {
    // Get template dependency via something state over app.

    const onChange = (value: string) => {

    }
    return (
        <div className="search-dependency">
            <SearchBox
                onChange={onChange}
            />
            <DependencyList />
            <AddDependencyFooter />
        </div>
    );
};

export default SearchDependency;