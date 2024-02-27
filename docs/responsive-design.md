# Note: Resposive Design from Udemy course

## max-width

> CSS の max-width プロパティは、要素の最大幅を設定します。これにより、使用される width プロパティの値が max-width で指定された値より大きくなるのを防ぎます。


`max-width`は`width`を上書きして、`min-width`は`max-wdith`を上書きする。

`max-width`の%指定はそれを適用する要素の親コンテナの幅に対する比率になる。

```css
.sub-container {
    width: 400px;
    /* 基本的に親要素の幅を100%占有する */
    max-width: 100%;
    min-width: 100px;
}
```

この場合、通常時は400px...ではなく、親要素の幅と同じ幅である。

ブラウザを縮小していき`max-width`の幅より小さくなると、要素の幅はコンテナ幅100%が適用される。

さらに縮小して100pxに到達すると`min-width`が適用される。

## rem

em: 親要素font-sizeに対する比率

rem: root要素(html)font-sizeに対する比率