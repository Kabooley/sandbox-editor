// import { Linter, SourceCodeFixer } from "../../node_modules/eslint/lib/linter";
// のうち、下記の方法ならLinterにはアクセスできる...
// node_modulesからの直接importができないのはwbepackの制限によるものかしら？tsconfigの制限によるものかしら？
import * as eslint from 'eslint';

/**
 * みつからんというエラー。
 *
 * https://gist.github.com/lydell/d62ce96c95c035811133a5396195da14
 *
 *
 * node ver16だからかも
 * https://github.com/eslint/eslint/issues/14986
 * 
 * https://github.com/typescript-eslint/typescript-eslint/issues/2153
 * 
 * */
import * as eslintrc from '@eslint/eslintrc';

type GlobalConf =
    | boolean
    | 'off'
    | 'readable'
    | 'readonly'
    | 'writable'
    | 'writeable';

// Types are according to ...
// https://unpkg.com/@eslint/eslintrc@2.1.2/dist/eslintrc-universal.cjs
// interface iLegacy {
//     environments: Map<string, Record<string, GlobalConf>>;
//     configOps: {
//       getRuleSeverity: (
//         ruleConfig: number | string | [number] | [string]
//       ) => 0 | 1 | 1;
//       normalizeToStrings: (obj: Object) => void;
//       isErrorSeverity: (config: number | string) => boolean;
//       isValidSeverity: (config: number | string) => boolean;
//       isEverySeverityValid: (obj: Object) => void;
//       normalizeConfigGlobal: (
//         configuredValue: boolean | string | null
//       ) => "readable" | "writeable" | "off";
//     };
//     ConfigValidator: ConfigValidator;
//     naming: {
//       __proto__: null;
//       normalizePackageName: (name: string, prefix: string) => string;
//       getShorthandName: (fullname: string, prefix: string) => string;
//       getNamespaceFromTerm: (term: string) => string;
//     };
// };

type iRuleMeta = { [key: string]: eslint.Rule.RuleModule['meta'] };

const linter = new eslint.Linter();
const rules = linter.getRules();
const ruleNames = Array.from(rules.keys());
const aaaa = Array.from(rules.entries());
const ruleMeta = Array.from(rules.entries()).reduce((result, [key, value]) => {
    result[key] = value.meta;
    return result;
}, {} as iRuleMeta);

const fix = false;
const options: eslint.Linter.Config = {
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'script',
        ecmaFeatures: {},
    },
    rules: [...rules.entries()].reduce((result, [ruleId, rule]) => {
        if (rule.meta && rule.meta.docs && rule.meta.docs.recommended) {
            result[ruleId] = ['error'];
        }
        return result;
    }, {} as eslint.Linter.RulesRecord),
    env: {
        es6: true,
    },
};

const lint = (text: string) => {
    try {
        const validator = new Legacy.ConfigValidator({ builtInRules: rules });

        validator.validate(options);
    } catch (error) {
        return {
            messages: [],
            output: text,
            validationError: error,
        };
    }
    try {
        const { messages, output } = linter.verifyAndFix(text, options, {
            fix,
        });
        let fatalMessage;

        if (messages && messages.length > 0 && messages[0].fatal) {
            fatalMessage = messages[0];
        }

        return {
            messages,
            output,
            fatalMessage,
        };
    } catch (error) {
        return {
            messages: [],
            output: text,
            error,
        };
    }
};

// --- usage ---
//
//
// const Usage = () => {
//     const { messages, output, fatalMessage, error: crashError, validationError } = lint("/* eslint quotes: [\"error\", \"double\"] */\nconst a = 'b';");

//     return (
//         <section className="playground__console" aria-labelledby="playground__console-label">
//         {/* <div className="playground__console-announcements visually-hidden" aria-live="polite" aria-atomic="true">
//         2 warnings and 1 error logged to the console.
//     </div> */}

//         {
//             isInvalidAutofix && <Alert type="error" text={`Invalid autofix! ${fatalMessage.message}`} />
//         }
//         {
//             crashError && <CrashAlert error={crashError} />
//         }
//         {
//             validationError && <Alert type="error" text={validationError.message} />
//         }
//         {messages.length > 0 && messages.map(message => (
//             message.suggestions ? (
//                 <Alert
//                     key={`${message.ruleId}-${message.line}-${message.column}`}
//                     type={message.severity === 2 ? "error" : "warning"}
//                     message={message}
//                     suggestions={message.suggestions}
//                     onFix={onFix}
//                 />
//             ) : (
//                 <Alert
//                     key={`${message.ruleId}-${message.line}-${message.column}`}
//                     type={message.severity === 2 ? "error" : "warning"}
//                     message={message}
//                     onFix={onFix}
//                 />
//             )
//         ))}
//     </section>

//     );
// }
