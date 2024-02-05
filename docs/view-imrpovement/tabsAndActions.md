# View: TabsAndActions

## Summary

-   [selected file への自動 scroll 機能](#selected-fileへの自動scroll機能)
-   [tabs-area のアクションの追加](#tabs-areaのアクションの追加)

## selected file への自動 scroll 機能

参考: https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback

-   selected ファイルが前回と異なるとき
-   selected ファイルが view 上に表示されていないとき

一旦アクティブなタブを表示させる機能を付けたけど、ScrollableElement と連携していないから水平スクロールがおかしな感じになる。

```TypeScript

    useEffect(() => {
        if (refTabs.current) {
            refTabs.current = refTabs.current.slice(0, filesOpening.length);

            // アクティブなタブを表示させる処理
            // TODO: 要修正
            const refSelectedFile = refTabs.current.find(
                (tab) => tab.className === 'tab active'
            );
            if (refSelectedFile !== undefined) {
                refSelectedFile.scrollIntoView();
            }
        }
    }, [filesOpening]);
```

ということで ScrollableElement はまだ修正が必要。

## tabs-area のアクションの追加

3 点リーダのアイコンを表示。
ScrollableElement に影響していないことを確認。
リサイズに影響していないことを確認。

TODO: アクションの実装。
