import type mocha from 'mocha';

/**
 * Mocha.Suiteを基に抽出されたテストレポート用オブジェクト
 */
export interface iSuite {
    title: string;
    suites: iSuite[];
    tests: iTest[];
    root: boolean;
    // undefinedは実行前、pendingは実行中、残りは結果（ひとつでもそのSuite内のtestがfailedならfailed）
    state: 'passed' | 'failed' | 'pending' | undefined;
    passed: number; // 通過したtestsの数
}

/**
 * Mocha.Testを基に抽出されたテストレポート用オブジェクト
 */
export interface iTest {
    title: string;
    // undefinedは実行前、pendingは実行中、残りは結果
    state: 'passed' | 'failed' | 'pending' | undefined;
    err?: Error | undefined;
    duration: number;
}

/***
 * テスト結果情報を載せた_suitesをテストファイルへ送信する
 *
 */
export const reportBrowserTest = (runner: Mocha.Runner) => {
    const _suites: iSuite[] = [];

    /**
     * - `suite`イベントでは、そのsuiteがroot suiteであった場合に、すべてのSuiteインスタンスとTestインスタンスが取得できるので、_suitesへSuiteインスタンス毎に保存する
     * - `suite`イベントの通常Suiteの場合は、どのSuiteが実行開始されたのかを知ることができるだけ
     * - `suite end`イベントの通常Suiteの場合は、どのSuiteが終了したのかを知ることができるだけ
     * - `end`イベントはすべてのSuiteが完了したことを示す
     * - Suiteにたいして`pass`や`fail`イベントは発行されない
     */
    runner
        .on('suite', (e) => {
            if (e.root) {
                console.log('START TEST');
                e.suites.forEach((s) => {
                    const { title, suites, tests } = s;
                    // TODO: nested suiteに未対応
                    if (suites.length) {
                        console.log('ネストされたsuiteあり');
                    }
                    const _suite: iSuite = {
                        title: title,
                        suites: [],
                        tests: [],
                        root: s.root,
                        state: 'pending',
                        passed: 0,
                    };
                    tests.forEach((t) => {
                        _suite.tests.push({
                            title: t.title,
                            state: 'pending',
                            err: undefined,
                            duration: 0,
                        } as iTest);
                    });
                    _suites.push(_suite);
                });
            }
            // ここでは特にやることはないけど、
            // どのSuiteが実行され始めたのかを知ることはできる
            else {
                console.log('SUITE: ', e.title);
                const _suite = _suites.find((s) => s.title === e.title);
                if (_suite !== undefined) {
                    _suite.state = 'pending';
                }
            }
        })
        .on('suite end', (e) => {
            // suiteではなくtestのイベントにも反応するため
            if (e.hasOwnProperty('type')) {
                return;
            }
            if (e.root) {
                console.log('DONE ALL SUITE');
            } else {
                console.log('DONE SUITE: ', e.title);
                const _suite = _suites.find((s) => s.title === e.title);
                if (_suite === undefined) {
                    return;
                }
                _suite.state = _suite.tests.every((t) => t.state === 'passed')
                    ? 'passed'
                    : 'failed';
            }
        })
        .on('end', () => {
            console.log('END SUITE');
            console.log(_suites);
            fetch('/end', {
                method: "POST", headers: { "Content-Type": "applecation/json" }, body: JSON.stringify(_suites)
            }).catch((e) => console.error(e));
        });

    runner
        .on('test', (e) => {
            console.log('START: ', e.title);
            const { title, parent } = e;
            if (parent === undefined) return;
            const _test = _suites
                .find((s) => s.title === parent.title)
                ?.tests.find((t) => t.title === title);
            if (_test === undefined) return;
            _test.state = 'pending';
        })
        .on('test end', (e) => {
            console.log('DONE: ', e.title);
            const { title, parent } = e;
            if (parent === undefined) return;
            const _test = _suites
                .find((s) => s.title === parent.title)
                ?.tests.find((t) => t.title === title);
            if (_test === undefined) return;
            _test.state = e.state;
            if (e.state === 'failed') {
                _test.err = e.err;
            }
        })
        // つけてみたけどとくにやることがない
        // .on('pass', (e) => {})
        .on('fail', (e) => {
            console.error(e.err);
        });
};