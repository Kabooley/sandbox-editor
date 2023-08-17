import React, { useEffect, useState } from 'react';

interface iProps {
    runnableJs: string;
}

// function htmlEscape(str: string) {
//     return str
//         .replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;')
//         .replace(/"/g, '&quot;');
// }

// let allLogs: string[] = [];

const DisplayErrors = ({ runnableJs }: iProps) => {
    useEffect(() => {
        anywayRun(runnableJs);
    }, [runnableJs]);

    const anywayRun = (jscode: string) => {
        try {
            eval(jscode);
        } catch (e) {
            console.log('play_run_js_fail');
            console.error(e);

            if (e instanceof SyntaxError && /\bexport\b/u.test(e.message)) {
                console.warn(
                    'Tip: Change the Module setting to "CommonJS" in TS Config settings to allow top-level exports to work in the Playground'
                );
            }
        }
    };

    return (
        <div>
            <div id="empty-message-container"></div>
            <div id="log-container"></div>
            <div id="log-tools"></div>
        </div>
    );
};

// const DisplayErrors = ({ runnableJs }: iProps) => {
//     useEffect(() => {
//         runWithCustomLogs(runnableJs);
//     }, [runnableJs]);

//     let allLogs: string[] = [];

//     const clearLogs = () => {
//         allLogs = [];
//         const logs = document.getElementById('log');
//         if (logs) {
//             logs.textContent = '';
//         }
//     };

//     const runWithCustomLogs = (
//         // closure: Promise<string>,
//         closure: string
//         // i: Function
//     ) => {
//         const noLogs = document.getElementById('empty-message-container');
//         const logContainer = document.getElementById('log-container')!;
//         const logToolsContainer = document.getElementById('log-tools')!;
//         if (noLogs) {
//             noLogs.style.display = 'none';
//             logContainer.style.display = 'block';
//             logToolsContainer.style.display = 'flex';
//         }

//         // DEBUG:
//         console.log('[DisplayErrors][runWithCustomLogs]');

//         // sidebarのLogへ内容を出力する
//         rewireLoggingToElement(
//             () => document.getElementById('log')!,
//             () => document.getElementById('log-container')!,
//             closure,
//             true
//             //   i
//         );
//     };

//     function rewireLoggingToElement(
//         eleLocator: () => Element,
//         eleOverflowLocator: () => Element,
//         // closure: Promise<string>,
//         js: string,
//         autoScroll: boolean
//         // i: Function
//     ) {
//         // DEBUG:
//         console.log('[DisplayErrors][rewireLoggingToElement]');

//         const rawConsole = console;
//         const replace = {} as any;
//         bindLoggingFunc(replace, rawConsole, 'log', 'LOG');
//         bindLoggingFunc(replace, rawConsole, 'debug', 'DBG');
//         bindLoggingFunc(replace, rawConsole, 'warn', 'WRN');
//         bindLoggingFunc(replace, rawConsole, 'error', 'ERR');
//         replace['clear'] = clearLogs;
//         const _console = Object.assign({}, rawConsole, replace);
//         try {
//             // const safeJS = sanitizeJS(js)
//             // eval(safeJS)
//             eval(js);
//         } catch (error) {
//             // console.error(i("play_run_js_fail"))
//             _console.log('play_run_js_fail');
//             _console.error(error);

//             if (
//                 error instanceof SyntaxError &&
//                 /\bexport\b/u.test(error.message)
//             ) {
//                 _console.warn(
//                     'Tip: Change the Module setting to "CommonJS" in TS Config settings to allow top-level exports to work in the Playground'
//                 );
//             }
//         }

//         // closure.then(js => {
//         //   const replace = {} as any
//         //   bindLoggingFunc(replace, rawConsole, "log", "LOG")
//         //   bindLoggingFunc(replace, rawConsole, "debug", "DBG")
//         //   bindLoggingFunc(replace, rawConsole, "warn", "WRN")
//         //   bindLoggingFunc(replace, rawConsole, "error", "ERR")
//         //   replace["clear"] = clearLogs
//         //   const console = Object.assign({}, rawConsole, replace)
//         //   try {
//         //     // const safeJS = sanitizeJS(js)
//         //     // eval(safeJS)
//         //     eval(js)
//         //   } catch (error) {
//         //     // console.error(i("play_run_js_fail"))
//         //     console.log("play_run_js_fail");
//         //     console.error(error)

//         //     if (error instanceof SyntaxError && /\bexport\b/u.test(error.message)) {
//         //       console.warn(
//         //         'Tip: Change the Module setting to "CommonJS" in TS Config settings to allow top-level exports to work in the Playground'
//         //       )
//         //     }
//         //   }
//         // })

//         function bindLoggingFunc(obj: any, raw: any, name: string, id: string) {
//             // DEBUG:
//             console.log('[DisplayErrors][bindLoggingFunc]');

//             obj[name] = function (...objs: any[]) {
//                 const output = produceOutput(objs);
//                 const eleLog = eleLocator();
//                 const prefix = `[<span class="log-${name}">${id}</span>]: `;
//                 const eleContainerLog = eleOverflowLocator();
//                 allLogs.push(`${prefix}${output}<br>`);
//                 eleLog.innerHTML = allLogs.join('<hr />');
//                 if (autoScroll && eleContainerLog) {
//                     eleContainerLog.scrollTop = eleContainerLog.scrollHeight;
//                 }
//                 raw[name](...objs);
//             };
//         }

//         // Inline constants which are switched out at the end of processing
//         const replacers = {
//             "<span class='literal'>null</span>": '1231232131231231423434534534',
//             "<span class='literal'>undefined</span>": '4534534534563567567567',
//             "<span class='comma'>, </span>":
//                 '785y8345873485763874568734y535438',
//         };

//         // const objectToText = (arg: any): string => {
//         function objectToText(arg: any): string {
//             // DEBUG:
//             console.log('[DisplayErrors][objectToText]');
//             console.log(arg);

//             const isObj = typeof arg === 'object';
//             let textRep = '';
//             if (arg && arg.stack && arg.message) {
//                 // special case for err
//                 textRep = htmlEscape(arg.message);
//             } else if (arg === null) {
//                 textRep = replacers["<span class='literal'>null</span>"];
//             } else if (arg === undefined) {
//                 textRep = replacers["<span class='literal'>undefined</span>"];
//             } else if (typeof arg === 'symbol') {
//                 textRep = `<span class='literal'>${htmlEscape(
//                     String(arg)
//                 )}</span>`;
//             } else if (Array.isArray(arg)) {
//                 textRep =
//                     '[' +
//                     arg
//                         .map(objectToText)
//                         .join(replacers["<span class='comma'>, </span>"]) +
//                     ']';
//             } else if (arg instanceof Set) {
//                 const setIter = [...arg];
//                 textRep =
//                     `Set (${arg.size}) {` +
//                     setIter
//                         .map(objectToText)
//                         .join(replacers["<span class='comma'>, </span>"]) +
//                     '}';
//             } else if (arg instanceof Map) {
//                 const mapIter = [...arg.entries()];
//                 textRep =
//                     `Map (${arg.size}) {` +
//                     mapIter
//                         .map(
//                             ([k, v]) =>
//                                 `${objectToText(k)} => ${objectToText(v)}`
//                         )
//                         .join(replacers["<span class='comma'>, </span>"]) +
//                     '}';
//             } else if (typeof arg === 'string') {
//                 textRep = '"' + htmlEscape(arg) + '"';
//             } else if (isObj) {
//                 const name = (arg.constructor && arg.constructor.name) || '';
//                 // No one needs to know an obj is an obj
//                 const nameWithoutObject =
//                     name && name === 'Object' ? '' : htmlEscape(name);
//                 const prefix = nameWithoutObject
//                     ? `${nameWithoutObject}: `
//                     : '';

//                 // JSON.stringify omits any keys with a value of undefined. To get around this, we replace undefined with the text __undefined__ and then do a global replace using regex back to keyword undefined
//                 textRep =
//                     prefix +
//                     JSON.stringify(
//                         arg,
//                         (_, value) =>
//                             value === undefined ? '__undefined__' : value,
//                         2
//                     ).replace(/"__undefined__"/g, 'undefined');

//                 textRep = htmlEscape(textRep);
//             } else {
//                 textRep = htmlEscape(String(arg));
//             }
//             return textRep;
//         }

//         function produceOutput(args: any[]) {
//             // DEBUG:
//             console.log('[DisplayErrors][produceOutput]');
//             console.log(args);

//             let result: string = args.reduce((output: any, arg: any, index) => {
//                 const textRep = objectToText(arg);
//                 const showComma = index !== args.length - 1;
//                 const comma = showComma ? "<span class='comma'>, </span>" : '';
//                 return output + textRep + comma + ' ';
//             }, '');

//             Object.keys(replacers).forEach((k) => {
//                 result = result.replace(
//                     new RegExp((replacers as any)[k], 'g'),
//                     k
//                 );
//             });

//             return result;
//         }
//     }

//     return (
//         <div>
//             <div id="empty-message-container"></div>
//             <div id="log-container"></div>
//             <div id="log-tools"></div>
//         </div>
//     );
// };

export default DisplayErrors;
