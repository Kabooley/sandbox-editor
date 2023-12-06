import React from 'react';
import Form from './Form';
import Column from './Column';
import {
    useDependencies,
    useRequestFetch,
} from '../../context/TypingLibsContext3';

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
    const dependencies = useDependencies();
    const requestFetchTypings = useRequestFetch();
    const sectionTitle = 'Dependencies';

    /***
     * - Validate value
     * - Check value is including version
     *
     * 参考
     * https://github.com/codesandbox/codesandbox-client/blob/6494ed0d14573a92a6776cbb514fe5a7a8e8d3df/packages/app/src/app/pages/Sandbox/SearchDependencies/index.tsx
     * */

    const send = (value: string) => {
        if (!value.length) return;

        let version = 'latest';
        const isScoped = value.startsWith('@');
        const splittedName = value.split('@');
        if (splittedName.length > (isScoped ? 2 : 1)) {
            version = splittedName.pop() as string;
        }
        const dependencyName = splittedName.join(`@`);

        console.log(
            `[DependencyList] Gonna fetch ${dependencyName} @ ${version}`
        );

        requestFetchTypings(dependencyName, version);
    };

    console.log('[DependencyList] running...');
    console.log(dependencies);

    return (
        <section className="pane-section">
            <div className="context-title" style={styleOfContext}>
                <span>{sectionTitle.toUpperCase()}</span>
            </div>
            <Form send={send} />
            <div className="dependency-list" style={styleOfDependencyList}>
                {dependencies.map((dep, index) => (
                    <Column
                        key={index}
                        handleClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            console.log(e);
                        }}
                        title={dep.moduleName}
                        version={dep.version}
                    />
                ))}
            </div>
        </section>
    );
};

export default DependencyList;
