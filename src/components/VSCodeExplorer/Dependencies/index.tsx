import React from 'react';
import Stack from '../Stack';
import Action from '../Action';
import Form from './Form';
import trashIcon from '../../../assets/vscode/dark/trash.svg';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import {
    selectTypingLibs,
    fetchModule,
    removeModules,
} from '../../../slices/typingLibsSlice';
import type { iDependency } from '../../../slices/typingLibsSlice';

interface iProps {
    id: number;
    collapse: boolean;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    height: number;
    width: number;
}

const Dependencies: React.FC<iProps> = ({
    id,
    collapse,
    onClick,
    height,
    width,
}) => {
    const title = 'dependencies';
    const { dependencies } = useAppSelector(selectTypingLibs);
    const dispatch = useAppDispatch();

    /***
     * Send input value as moduleName@version for fetch request.
     *
     * - Check value is including version
     * https://github.com/codesandbox/codesandbox-client/blob/6494ed0d14573a92a6776cbb514fe5a7a8e8d3df/packages/app/src/app/pages/Sandbox/SearchDependencies/index.tsx
     *
     * TODO: この段階におけるmodulenameやversionのvalidationは必要かも？
     * */
    const requestFetchModule = (value: string) => {
        if (!value.length) return;

        let version = 'latest';
        const isScoped = value.startsWith('@');
        const splittedName = value.split('@');
        if (splittedName.length > (isScoped ? 2 : 1)) {
            version = splittedName.pop() as string;
        }
        const dependencyName = splittedName.join(`@`);

        // typeLibsCommand('request', splittedName[0], version);
        dispatch(
            fetchModule({
                moduleName: splittedName[0],
                version: version,
                devDependency: false,
            })
        );
    };

    const renderActionDeleteDependency = (dependency: iDependency) => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            dispatch(
                removeModules([
                    {
                        moduleName: dependency.moduleName,
                        version: dependency.version,
                        devDependency: dependency.devDependency,
                    },
                ])
            );
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
            <Form send={requestFetchModule} />
            {dependencies.map((dd, index) => (
                <div className="stack-body-list__item dependencies" key={index}>
                    <div
                        className="indent"
                        style={{ paddingLeft: `${nestDepth * 1.6}rem` }}
                    ></div>
                    <h3 className="item-label">{dd.moduleName}</h3>
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
