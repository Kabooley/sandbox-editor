import React, { useEffect, useRef } from 'react';
import Form from './Form';
import Column from './Column';
// //
// // TODO: codesandboxでworkerが使えなかったための措置。正式なworkerとのやり取りをすること
// //
// import { imitationFetchLibsWorker } from "../../temporaryWorker/fetchLibs.worker";

const dummyDependencies = [
    { name: 'react', version: '17.0.2' },
    { name: 'react-dom', version: '17.0.2' },
    { name: 'axios', version: '^1.4.0' },
    { name: 'localforage', version: '^1.10.0' },
    { name: '@types/react', version: '17.0.39' },
    { name: 'prettier', version: '2.8.8' },
    { name: 'tooMuchLongNameModule/suchAWaste', version: '9.9.9' },
];

const styleOfContext: React.CSSProperties = {
    padding: '8px 16px',
};

const styleOfDependencyList: React.CSSProperties = {
    paddingTop: '8px',
    paddingBottom: '16px',
    fontSize: '12px',
};

const DependencyList = () => {
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

        // TODO: validator
        let version = 'latest';
        const isScoped = value.startsWith('@');
        const splittedName = value.split('@');
        if (splittedName.length > (isScoped ? 2 : 1)) {
            version = splittedName.pop() as string;
        }
        const dependencyName = splittedName.join(`@`);

        console.log(`Gonna fetch ${dependencyName} @ ${version}`);

        // // dispatch install dependency request
        // imitationFetchLibsWorker({
        //   name: dependencyName,
        //   version: version
        // })
        //   .then((result) => {
        //     console.log("Got result");
        //     if (result === undefined) return;
        //     const { name, version, typings, err } = result;
        //     if (err) throw err;

        //     console.log(`Result: ${name} @ ${version}`);
        //     console.log(result);
        //   })
        //   .catch((err) => console.error(err));
    };

    return (
        <section className="pane-section">
            <div className="context-title" style={styleOfContext}>
                <span>{sectionTitle.toUpperCase()}</span>
            </div>
            <Form send={send} />
            <div className="dependency-list" style={styleOfDependencyList}>
                {dummyDependencies.map((dd, index) => (
                    <Column
                        key={index}
                        handleClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            console.log(e);
                        }}
                        title={dd.name}
                        version={dd.version}
                    />
                ))}
            </div>
        </section>
    );
};

export default DependencyList;
