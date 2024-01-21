import React, { useState, useEffect } from 'react';
import Form from './Form';
import Column from './Column';
import { useDependencies, useCommand } from '../../context/TypingLibsContext';

const styleOfContext: React.CSSProperties = {
    padding: '8px 16px',
};

const styleOfDependencyList: React.CSSProperties = {
    paddingTop: '8px',
    paddingBottom: '16px',
    fontSize: '12px',
};

/***
 *
 * TODO: requestしたのがどうなったのか結果を待つ間state管理するか？そうすればローディング、失敗、とか表示できるかな？
 * */
const DependencyList = () => {
    const [requesting, setRequesting] = useState<string>('');
    const dependencies = useDependencies();
    const command = useCommand();
    const sectionTitle = 'Dependencies';

    useEffect(() => {
        // `requesting`に値が含まれているときに...
        if (requesting.length) {
            // `requesting`と同じ名前が`dependencies`にあったら...
            const module = dependencies.find((dep) =>
                dep.moduleName
                    .toLocaleLowerCase()
                    .localeCompare(requesting.toLocaleLowerCase())
            );
            // ロード完了していることがわかったら
            if (module !== undefined && module.state === 'loaded') {
                // TODO: なんかロードできました見たいなメッセージを5秒ほど表示する
                setRequesting('');
            }
            // // ロード失敗していることがわかったら
            // else if (module !== undefined && module.state === 'failed') {
            //     // TODO: なんか失敗しました見たいなメッセージを5秒ほど表示する
            //     setRequesting('');
            // }
        }
        // これを依存関係に含めると反応しなくなるのでは？
    }, [requesting]);

    /***
     * - Validate value
     * - Check value is including version
     *
     * 参考
     * https://github.com/codesandbox/codesandbox-client/blob/6494ed0d14573a92a6776cbb514fe5a7a8e8d3df/packages/app/src/app/pages/Sandbox/SearchDependencies/index.tsx
     * */

    const sendRequest = (value: string) => {
        if (!value.length) return;

        let version = 'latest';
        const isScoped = value.startsWith('@');
        const splittedName = value.split('@');
        if (splittedName.length > (isScoped ? 2 : 1)) {
            version = splittedName.pop() as string;
        }
        const dependencyName = splittedName.join(`@`);

        console.log(`[DependencyList] Request ${dependencyName} @ ${version}`);

        command('request', dependencyName, version);
        setRequesting(dependencyName);
    };

    const handleRemove = (moduleName: string, version: string) => {
        // DEBUG:
        console.log(`[DependencyList] Remove ${moduleName} @ ${version}`);

        command('remove', moduleName, version);
    };

    return (
        <section className="pane-section">
            <div className="context-title" style={styleOfContext}>
                <span>{sectionTitle.toUpperCase()}</span>
            </div>
            <Form send={sendRequest} />
            <div className="dependency-list" style={styleOfDependencyList}>
                {dependencies.map((dep, index) => (
                    <Column
                        key={index}
                        handleClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            console.log(e);
                        }}
                        handleRemove={handleRemove}
                        title={dep.moduleName}
                        version={dep.version}
                    />
                ))}
            </div>
        </section>
    );
};

export default DependencyList;
