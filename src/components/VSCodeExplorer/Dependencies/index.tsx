import React from 'react';
import Stack from '../Stack';
import Action from '../Action';
import Form from './Form';
import trashIcon from '../../../assets/vscode/dark/trash.svg';
import { ascendingOrderComparerFactory } from '../../../utils';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import {
    selectTypingLibs,
    fetchModule,
    fetchAnotherVersionModule,
    removeModules,
    LoadingStatus,
} from '../../../slices/typingLibsSlice';
import type { iDependency } from '../../../slices/typingLibsSlice';
import { reflectDependenciesToPackageJson } from '../../../slices/packageJsonSlice';

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
     * Requesting module may be already exist but another version.
     *
     * - Check value is including version
     * https://github.com/codesandbox/codesandbox-client/blob/6494ed0d14573a92a6776cbb514fe5a7a8e8d3df/packages/app/src/app/pages/Sandbox/SearchDependencies/index.tsx
     *
     * TODO: この段階におけるmodulenameやversionのvalidationは必要かも？
     * */
    const requestFetchModule = (value: string) => {
        if (!value.length) return;

        // Seperate modulename and version
        let version = 'latest';
        const isScoped = value.startsWith('@');
        const splittedName = value.split('@');
        if (splittedName.length > (isScoped ? 2 : 1)) {
            version = splittedName.pop() as string;
        }
        const dependencyName = splittedName.join(`@`);

        // Check if requesting module is already exist
        const exist = dependencies.find(
            (dep) => dep.moduleName === dependencyName
        );

        // Request another version of exist module.
        if (exist && exist.version !== version) {
            dispatch(
                fetchAnotherVersionModule({
                    moduleName: dependencyName,
                    version: version,
                    prevVersion: exist.version,
                    devDependency: false,
                })
            )
                .unwrap()
                .then(() => dispatch(reflectDependenciesToPackageJson()))
                .catch(() => {
                    dispatch(reflectDependenciesToPackageJson());
                    // 一度unwrapしたらエラーオブジェクトはスローされるので今のところはエラーを消費するためにcatchを用意している
                    // 後ほどユーザ向けの通知を呼び出す関数をここで呼ぶかも
                    // TODO: (もしくはreflectDependenciesToPackageJson()を呼び出すのはtypingLibsにするかも)
                });
        }
        // Request new module
        else if (exist === undefined) {
            dispatch(
                fetchModule({
                    moduleName: dependencyName,
                    version: version,
                    devDependency: false,
                })
            )
                .unwrap()
                .then(() => dispatch(reflectDependenciesToPackageJson()))
                .catch(() => {
                    dispatch(reflectDependenciesToPackageJson());
                    // 一度unwrapしたらエラーオブジェクトはスローされるので今のところはエラーを消費するためにcatchを用意している
                    // 後ほどユーザ向けの通知を呼び出す関数をここで呼ぶかも
                    // TODO: (もしくはreflectDependenciesToPackageJson()を呼び出すのはtypingLibsにするかも)
                });
        }
        // 失敗した依存関係の再取得
        else if(exist && exist.state === LoadingStatus.FAILED) {
            dispatch(
                fetchModule({
                    moduleName: dependencyName,
                    version: version,
                    devDependency: false,
                })
            )
                .unwrap()
                .then(() => dispatch(reflectDependenciesToPackageJson()))
                .catch(() => {
                    dispatch(reflectDependenciesToPackageJson());
                    // 一度unwrapしたらエラーオブジェクトはスローされるので今のところはエラーを消費するためにcatchを用意している
                    // 後ほどユーザ向けの通知を呼び出す関数をここで呼ぶかも
                    // TODO: (もしくはreflectDependenciesToPackageJson()を呼び出すのはtypingLibsにするかも)
                });
        }
        // Ignore because request module is already exist.
        else return;
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
            )
                .unwrap()
                .then(() => dispatch(reflectDependenciesToPackageJson()));
        };
        return (
            <Action
                handler={clickHandler}
                icon={trashIcon}
                altMessage="Delete dependency permanently"
            />
        );
    };

    // dependencies配列の要素をmoduleName昇順で並び替えるcomparerの生成
    const comparerForDescendeingModuleName = React.useCallback(
        ascendingOrderComparerFactory<iDependency>('moduleName'),
        []
    );

    const nestDepth = 1;

    /**
     * - dependencies[].state: FAILEDは表示しない
     * - dependenciesはmoduleNameプロパティの値を昇順に慣れべ変えられる
     * */
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
            {dependencies
                .filter((dd) => dd.state !== LoadingStatus.FAILED)
                .sort(comparerForDescendeingModuleName)
                .map((dd, index) => (
                    <div
                        className="stack-body-list__item dependencies"
                        key={index}
                    >
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
