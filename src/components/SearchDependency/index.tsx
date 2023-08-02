/***
 * https://github.com/codesandbox/codesandbox-client/blob/9a75ddff1312faaf9fcd3f7f8a019de0f464ab47/packages/app/src/app/pages/Sandbox/SearchDependencies/index.tsx
 * 
 * */ 
import React from 'react';
import SearchBox from './SearchBox';
import Dependency from './Dependency';


const dummy_dependency_list = [
    "react@18.0.2",
    "react-dom@18.0.2",
    "react@18.0.2",
    "react@18.0.2",
    "react@18.0.2",
    "react@18.0.2",
    "react@18.0.2",
    "react@18.0.2",
];


const DependencyList = () => {
    return (
        <ul>
            {
                dummy_dependency_list.map(dep => <Dependency dependency={dep} />)
            }
        </ul>
    );
}

const SearchDependency = () => {
    // Get template dependency via something state over app.

    const onChange = (value: string) => {};

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // TODO: codesandboxのクソ機能によってコードが失われました。
        // input valueをformイベントから取得してください

        // dispatch value to install type as dependency
        // udpate dependency list
        let searchValue = value;
        // Retrieve string previous of `@` character.
        if (searchValue.includes('@') && !searchValue.startsWith('@')) {
            searchValue = value.split('@')[0];
        }

        if (searchValue.startsWith('@')) {
            // if it starts with one and has a version
            if (searchValue.split('@').length === 3) {
                const part = searchValue.split('@');
                searchValue = `@${part[0]}${part[1]}`;
            }
        }

        // Get dependency by dispatching `fetch-libs` action or something like that.
    };

    return (
        <div className="search-dependency">
            <SearchBox
                onChange={onChange}
                handleSubmit={onSubmit}
            />
            <DependencyList />
        </div>
    );
};

export default SearchDependency;