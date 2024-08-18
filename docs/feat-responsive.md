# Responsive 化

sandbox-editor のレイアウトをレスポンシブ化した。

## TODOs

- TODO: [レイアウト以外のレスポンシブ対応](#responsive-items)

## Summary

- [機能説明](#機能説明)
- [既知の問題](#既知の問題)
- [Learn responsive design](#Learn-responsive-design)
- [test](#test)
- [ブラウザズーム時にレイアウトが崩れる問題](#ブラウザズーム時にレイアウトが崩れる問題)

## 機能説明

#### breakpoint

スマートフォンサイズ、タブレットサイズ、それ以上（デスクトップ）とした。

```scss
$media-phone: 660px;
$media-tablet: 1279px;
$media-fromTablet: 660px;
$media-fromDesktop: 1280px;
```

#### css

NOTE:　まだ css は詰めていない。

```scss
// sass/variables/_mixins.scss

/* max size of tablet */
@media only screen and (max-width: $media-tablet) {
  .header-section {
    background-color: red;
  }
}

/* less than phone size */
@media only screen and (max-width: $media-phone) {
  .header-section {
    background-color: blue;
  }
}

/* min size of tablet */
@media only screen and (min-width: $media-fromTablet) {
  .header-section {
    background-color: red;
  }
}

/* min size of desktop */
@media only screen and (min-width: $media-fromDesktop) {
  .header-section {
    background-color: gray;
  }
}
```

#### source direcotry modification

```diff bash
\---src
    |
    +---components
+   |   |   sliderPane.css
+   |   |   SliderPane.tsx
    |   ...
    |
    ...
    |
    +---Layout
    |   |   EditorSection.tsx
    |   |   FooterSection.tsx
    |   |   Header.tsx
    |   |   index.tsx
    |   |   MainContainer.tsx
    |   |   PaneSection.tsx
    |   |   PreviewSection.tsx
    |   |   SplitPane.tsx
    |   |
+   |   +---desktop
+   |   |       index.tsx
+   |   |
+   |   +---phone
+   |   |       EditorSection.tsx
+   |   |       index.tsx
+   |   |       PaneSection.tsx
+   |   |
+   |   \---tablet
+   |           EditorSection.tsx
+   |           index.tsx
+   |           PreviewSection.tsx
+   |
    +---sass
    |   |   main.scss
    |   |
    |   +---abstracts
    |   |       _functions.scss
    |   |       _mixins.scss
    |   |       _variables.scss
    |   |
    |   +---base
    |   |       _animations.scss
    |   |       _base.scss
    |   |       _commons.scss
    |   |       _typography.scss
    |   |       _utilities.scss
    |   |
    |   +---components
    |   |       _dependencyList.scss
    |   |       _editor.scss
    |   |       _footer.scss
    |   |       _header.scss
    |   |       _modal.scss
    |   |       _pane.scss
    |   |       _preview.scss
    |   |       _skeletons.scss
    |   |       _tabsAndActions.scss
    |   |
    |   +---layout
    |   |       _main.scss
    |   |
    |   \---vendor
    |           _react-resizable.scss
    |
    +---slices
    |       bundlerSlice.ts
    |       filesSlice.ts
    |       layoutSlice.ts
    |       packageJsonSlice.ts
    |       typingLibsSlice.ts
    |
    +---utils
+   |       limitWithinRange.ts
    |       ...
    |
    ...
```

#### layoutSlice.ts

これまでは desktop 特化の state であったが、各 media タイプごとに state を用意することにした

リサイズに伴う調整のためにこれ以上条件分岐を増やすと複雑になりすぎて管理できなくなるため。

```diff TypeScript
interface iState {
  // --- @media common-media ---
  // Enable or disable pointer events on iframe[title="preview"]
  pointerEventsOnPreviewIframe: boolean
  // Show modal if true
  showModal: boolean
  // This data will be passed to modal dialog
  modalDataSet: iModalDataTemplate
+ // media type
+ mediaType: MediaTypes
+ //
+ windowWidth: number
+ // --- @media desktop ---
+ mediaDesktopEditorWidth: number
+ mediaDesktopPaneWidth: number
+ mediaDesktopPaneWidthOnClose: number
+ mediaDesktopPreviewWidthOnClose: number
+ // Switch status of displaying Preview
+ isPreviewDisplay: boolean
+ // Switch status of displaying Sidebar
+ isSidebarDisplay: boolean
+ // --- @media tablet ---
+ mediaTabletEditorWidth: number
+ mediaTabletPreviewWidthOnClose: number
+ isTabletPreviewDisplay: boolean
+ // --- @media tablet and phone ---
+ isSliderPaneDisplay: boolean
+ isPhonePreviewDisplay: boolean
- // width of div.editor-section
- editorWidth: number;
- // width of div.pane. This will 0 when pane is close
- paneWidth: number;
- // width of div.pane when it will close
- paneWidthOnClose: number;
- // width of div.preview-section when it will close
- previewWidthOnClose: number;
}

const initialState: iState = {
  pointerEventsOnPreviewIframe: true,
  showModal: false,
  modalDataSet: {
    message: '',
    description: '',
    actions: [],
  },
  mediaType: MediaTypes.Desktop,
  windowWidth: window.innerWidth,

+ // @media desktop
+ mediaDesktopEditorWidth: $initialLayout.editorLayout.defaultWidth,
+ mediaDesktopPaneWidth: $initialLayout.paneLayout.defaultWidth,
+ mediaDesktopPaneWidthOnClose: $initialLayout.paneLayout.defaultWidth,
+ mediaDesktopPreviewWidthOnClose:
+   window.innerWidth -
+   $initialLayout.editorLayout.defaultWidth -
+   $initialLayout.paneLayout.defaultWidth,
+ isPreviewDisplay: true,
+ isSidebarDisplay: true,
+ // @media tablet
+ mediaTabletEditorWidth: Math.trunc(window.innerWidth * 0.6),
+ mediaTabletPreviewWidthOnClose:
+   window.innerWidth - Math.trunc(window.innerWidth * 0.6),
+ isTabletPreviewDisplay: true,
+ // @media phone
+ isSliderPaneDisplay: false,
+ isPhonePreviewDisplay: false,
- editorWidth: $initialLayout.editorLayout.defaultWidth,
- paneWidth: $initialLayout.paneLayout.defaultWidth,
- paneWidthOnClose: $initialLayout.paneLayout.defaultWidth,
- previewWidthOnClose:
-     window.innerWidth -
-     $initialLayout.editorLayout.defaultWidth -
-     $initialLayout.paneLayout.defaultWidth,
}

```

media type が desktop なら editor width は state.mediaDesktopEditorWidth に従うが、

media type が tablet なら state.mediaTabletEditorWidth に従う。

この変更と合わせて media ごとに Layout コンポーネントを追加した

###### state.mediaType

Layout/index.tsx で`react-use`の`useMedia`で現在の window.innerWidth のサイズがどのメディアタイプに一致するのか検知してメディアタイプが変わったら layoutSlcie.ts の state.mediaType を更新する

Layout/index.tsx は layoutSlcie.ts の state.mediaType に応じて出力する Layout コンポーネントを切り替える

##### layoutSliceActions.UpdateWindowWidth

src/Layout/index.ts で window のリサイズを検知して layoutSlice.ts の state.windowWidth 他を更新する

window のリサイズと media ごとの切り替えに合わせて各 Layout 関連コンポーネントの state を更新する

#### desktop

`@media screen and (min-width: 1280px)`

- これまでどおり。

```
┌──────────────────────────────────────────────────────┐
│ HEADER                                               │
└──────────────────────────────────────────────────────┘
┌──── MainContainer ───────────────────────────────────┐
│┌───── SplitPane ────────────────────────────────────┐│
││┌──────────┬───────────────────┬───────────────────┐││
│││ Pane     │ Editor            │  Preview          │││
│││          │                   │                   │││
│││          │                   │                   │││
│││          │                   │                   │││
│││          │                   │                   │││
│││          │                   │                   │││
│││ toggle   │                   │  toggle-able      │││
│││  -able   │                   │                   │││
│││          │                   │                   │││
│││          │                   │                   │││
│││     <-resizable->       <-resizable->            │││
│││          │                   │                   │││
│││          │                   │                   │││
│││          │                   │                   │││
│││          │                   │                   │││
│││          │                   │                   │││
│││          │                   │                   │││
│││          │                   │                   │││
│││          │                   │                   │││
││└──────────┴───────────────────┴───────────────────┘││
│└────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│ FOOTER                                               │
└──────────────────────────────────────────────────────┘
```

```TypeScript
const DesktopMediaLayout = () => {
    return (
        <>
            <HeaderSection />
            <MainContainer>
                <SplitPane>
                    <PaneSection />
                    <EditorSection />
                    <PreviewSection />
                </SplitPane>
            </MainContainer>
            <FooterSection />
            <Modal />
        </>
    );
};

```

https://qiita.com/paty-fakename/items/c82ed27b4070feeceff6

#### tablet

`@media screen and (max-width: 1279px)`

and

`@media screen and (min-width: 660px)`

- Pane はスライドイン・アウトできる、MainContainer のレイアウトから外れたアイテムになる
- 画面は Editor と Preview で分割する
- Editor と Preview は領域リサイズ可能

```
┌──────────────────────────────────────────────────────┐
│ HEADER                                               │
└──────────────────────────────────────────────────────┘
┌──── MainContainer ───────────────────────────────────┐
│┌───── SplitPane ────────────────────────────────────┐│
││┌──────────────────────────────┬───────────────────┐││
│││ Editor                       │  Preview          │││
────────────────┐                │                   │││
  SliderPane    │                │                   │││
                │                │                   │││
                │                │                   │││
slide-in ->     │                │                   │││
<- slide-out>   │                │  toggle-able      │││
                │                │                   │││
                │                │                   │││
                │                │                   │││
                │           <-resizable->            │││
                │                │                   │││
                │                │                   │││
                │                │                   │││
                │                │                   │││
                │                │                   │││
                │                │                   │││
                │                │                   │││
────────────────┘                │                   │││
││└──────────────────────────────┴───────────────────┘││
│└────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│ FOOTER                                               │
└──────────────────────────────────────────────────────┘
```

```TypeScript
const TabletMediaLayout = () => {
  return (
    <>
      <HeaderSection />
      <MainContainer>
        <SplitPane>
          <PaneSection />
          <EditorSection />
          <PreviewSection />
        </SplitPane>
      </MainContainer>
      <FooterSection />
      <Modal />
    </>
  )
}
```

#### phone

`@media screen and (max-width: 660px)`

- 画面は Editor か Preview どちらかを表示する
- Header に Editor か Preview どちらを表示するか選べるボタンを表示する
- Pane はスライドイン・アウトできる、MainContainer のレイアウトから外れたアイテムになる

```
┌──────────────────────────────────────────────────────┐
│ HEADER                                               │
└──────────────────────────────────────────────────────┘
┌──── MainContainer ───────────────────────────────────┐
│┌───── SplitPane ────────────────────────────────────┐│
││┌──────────────────────────────────────────────────┐││
│││                Editor                          ┌─────────────────────────────────────────┐
────────────────┐                                  │    Preview                              |
  SliderPane    │                                  │                                         |
                │                                  │                                         |
                │                           <- toggle-able ->                                |
slide-in ->     │                                  │                                         |
<- slide-out>   │                                  │                                         |
                │                                  │                                         |
                │                                  │                                         |
                │                                  │                                         |
                │                                  │                                         |
                │                                  │                                         |
                │                                  │                                         |
                │                                  │                                         |
                │                                  │                                         |
                │                                  │                                         |
────────────────┘                                  │                                         |
││└────────────────────────────────────────────────│                                         |
│└─────────────────────────────────────────────────└─────────────────────────────────────────┘
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│ FOOTER                                               │
└──────────────────────────────────────────────────────┘
```

```TypeScript
const PhoneMediaLayout = () => {
  const { isPhonePreviewDisplay } = useAppSelector(selectLayoutState)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (isPhonePreviewDisplay) {
      dispatch(layoutActions.TogglePhonePreview())
    }
  }, [])

  return (
    <>
      <HeaderSection />
      <MainContainer>
        <SplitPane>
          <PaneSection />
          {isPhonePreviewDisplay ? <PreviewSection /> : <EditorSection />}
        </SplitPane>
      </MainContainer>
      <FooterSection />
      <Modal />
    </>
  )
}
```

## 既知の問題

#### EditorSection を右へリサイズすると Preview 領域へ侵入してまでリサイズが可能となっている

原因：JavaScript で制御する editor の幅と css で定義した.preview の min-width が衝突した結果

JavaScript の幅制御をしているうちに.preview の min-width のことを忘れていたため

preview はどんなに右端へ狭められても 100px のこるが、

reactresizable の maxConstraints はそのことを考慮していないので preview 領域を超えてリサイズできてしまっている

## Learn responsive design

参考：

https://www.w3schools.com/cssref/css3_pr_mediaquery.php

#### `@media (min-width:...)`で指定するサイズは何基準

`window.innerWidth` を基準としている。

物理デバイスのスクリーンサイズではない。

#### 定義順序は重要である

css なので、詳細度が同じ場合あとから定義した方が優先される。

つまり media query でも同じ要素への定義が複数ある場合、詳細度が同じならばあとから定義した方が優先される

以下の場合、

`max-width: 660px`と`max-width: 1279px`は、window.innerWidth が 660px 以下の場合両方真である。

なのでこの定義の順番が重要である。

この場合、`max-width: 1279px`定義の後に`max-width: 660px`定義なので

両者が真であった場合常に`max-width: 660px`定義が優先される。

そのため width の値によってどの定義が適用されるかがちゃんと区別されている。（重複がないという意味）

```scss

$media-phone: 660px;
$media-tablet: 1279px;
$media-fromTablet: 660px;
$media-fromDesktop: 1280px;

/* max size of tablet */
@media only screen and (max-width: $media-tablet) {
  .header-section {
    background-color: red;
  }
}

/* less than phone size */
@media only screen and (max-width: $media-phone) {
  .header-section {
    background-color: blue;
  }
}

/* min size of tablet */
@media only screen and (min-width: $media-fromTablet) {
  .header-section {
    background-color: red;
  }
}

/* min size of desktop */
@media only screen and (min-width: $media-fromDesktop) {
  .header-section {
    background-color: gray;
  }
}

```

#### JavaScript との連携 `window.matchMedia` API

https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia

上記のような css の media query 条件を指定すると現在の`docuemnt`の状態からその条件に一致してくれているのかを教えてくれる

css の media query 機能と JavaScript の style に影響する部分とうまく連携させる場合に使うとよさそうな API である。

`onresize`イベントと何が違うのかといえば、例えば window をリサイズしたときに、この API は指定した値をまたいだ時にだけ反応するため

余計なイベントが発生しない。

で、それを React 向けに使いやすい hook にしてくれたのが`react-use`の`useMedia`である。

使ううえでの注意として、戻り値は css の media query の適用ルールと同様であるということ。

たとえば以下の時

```TypeScript
  const isMediaPhone = useMedia('(max-width:660px)')
  const isMediaTabletMin = useMedia('(min-width:661px)')
  const isMediaTabletMax = useMedia('(max-width:1279px)')
  const isMediaDesktop = useMedia('(min-width:1280px)')
```

window.innerWidth が 650px: `isMediaPhone`と`isMediaTabletMax`は真である。
window.innerWidth が 800px: `isMediaTabletMin`と`isMediaTabletMax`は真である。

JavaScript なので、css のような「あとから定義したほうが優先される」という機能はない。

そこは開発者が気を付けて取り扱う必要がある。

となるので条件分岐は css の優先順位に基づいて設けるのがいいかも。

```TypeScript
if(isMediaPhone && !isMediaTabletMin) {
  // media is phone
}
else if(isMediaTabletMin && isMediaTabletMax) {
  // media is tablet
}
else if(isMediaDesktop) {
  // Now that media is desktop
}
```

#### meta viewport 設定

https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Media_queries#the_viewport_meta_tag

https://stackoverflow.com/a/30709473/22007575

viewport meta タグは media query を設定するうえで欠かせない。

viewport meta タグがないと...デバイスの基本ビューポートを設定するために使われる

viewport meta タグ\*\*は、モバイルブラウザのレイアウトを制御するために使用されます。

これがないと、モバイルデバイスはページ全体をデスクトップ画面のように表示し、あたかもズームアウトしたかのような効果をもたらします。

この場合、ユーザーはページ上のテキストやその他のコンテンツを表示するために、ピンチズームやスワイプを何度も行う必要があります。

desktop 向けのブラウザ用 web サイトのアプリケーションなら mediaquery の設定を導入しないし必要ないかもしれないけれど

media query を導入する場合、viewport の基本設定を設けておかなくてはならない。

```diff html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
+   <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sandbox Editor Sample</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

事実、以下の media query のうち`max-width: 660px`がなぜか効かなかったけど、viewport 設定を入れたら効くようになった。

660px が効かなかったのは、デフォルトの仮想 viewport を 980px と設定しているため、それ以下の media query のサイズは判定に入らなくなるからである。

> However, this mechanism is not so good for pages that are optimized for narrow screens using media queries — if the virtual viewport is 980px for example, media queries that kick in at 640px or 480px or less will never be used, limiting the effectiveness of such responsive design techniques. The viewport <meta> element mitigates this problem of virtual viewport on narrow screen devices.

https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag#background

```scss
// _mixins.scss
$media-phone: 660px;
$media-tablet: 1279px;
$media-fromTablet: 660px;
$media-fromDesktop: 1280px;

/* max size of tablet */
@media only screen and (max-width: $media-tablet) {
  .header-section {
    background-color: red;
  }
}

/* less than phone size */
@media only screen and (max-width: $media-phone) {
  .header-section {
    background-color: blue;
  }
}

/* min size of tablet */
@media only screen and (min-width: $media-fromTablet) {
  .header-section {
    background-color: red;
  }
}

/* min size of desktop */
@media only screen and (min-width: $media-fromDesktop) {
  .header-section {
    background-color: gray;
  }
}

```

#### ビューポートのメタタグ

viewport は、ブラウザにおいては閲覧中のウェブサイトの内容の内、現在見えている部分を指す。

これはユーザの操作による拡大縮小によって先ほどまで見えていなかった分が見えるようになったりする。

このように視覚的に得られる viewport を視覚的 viewport、表示しきれていない部分のすべての要素を含めたのがレイアウト viewport という。

レイアウトビューポートは大きさも形も変わらない大きな画像で、その画像を見るために用意された拡大縮小可能な窓枠をあるとすれば、

窓枠からのぞける部分が視覚的 viewport である。窓枠は拡大縮小できるので見える部分は変更されるけど、元の画像自体は変更されない。

ということで、（視覚的）viewport は実際の web サイトのサイズと一致しない場合が多い。

モバイル端末など狭い画面のデバイスは物理的なスクリーンサイズよりも広い仮想的なビューポートでページをレンダリングする。

こうした措置はモバイル最適化されていない web ページをモバイルでも見やすく表示するために取られている措置である。

これがかえって media query を採用しているページに対して逆効果をもたらすことになった。

つまり、仮想 viewport サイズを 980px であるとき、`@media screen and (min-width: 660px)`のような 980px を下回る設定は採用されなくなってしまう。

そこで media query を設定している web app には viewport を設定した meta タグが必要になってくるのである。

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

`width`がビューポートの大きさを制御する。

`initial-scale`は`1`に設定するべき？するべき。

viewport meta タグに`initial-scale=1`を設定することで、レイアウトがすべてのデバイスで期待通りに動作し、メディアクエリが正しく機能するようになります。

1. **一貫性** ウェブサイトが異なるデバイス間で一貫して表示されるようにします。initial-scale=1`を設定しないと、ブラウザは独自のヒューリスティックに基づいてウェブページを拡大縮小する可能性があり、一貫性のない表示体験になる可能性があります。

2. **レイアウトのコントロール** モバイルデバイスでのレイアウトをよりコントロールできるようになります。メディアクエリを使用すると、特定のビューポートサイズに合わせてデザインすることになります。initial-scale=1`でビューポートが正しく設定されていない場合、メディアクエリが期待通りに動作しない可能性があります。

3. 3.**予期せぬ動作を避ける**： initial-scale`に1以外の値を設定すると、予期しない動作をすることがあります。例えば、`initial-scale=0.5`と設定した場合、ブラウザはズームアウトするためにビューポートの幅を 2 倍にしてしまい、レイアウトが崩れてしまう可能性があります。

https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag

https://stackoverflow.com/a/6333966

#### breakpoint は重複していていいのか？

たとえば下記の定義がされたアプリケーションは、window の幅が 660px だった時どちらが優先される？

答えは CSS の定義がどちらが優先されるかに従う。

つまり、同じ詳細度ならばあとから定義された方が採用される。

なので以下の場合、window の幅が 660px の時`.header-section`は`red`になる

```css

/* less than phone size */
@media only screen and (max-width: 660px) {
  .header-section {
    background-color: blue;
  }
}

/* min size of tablet */
@media only screen and (min-width: 660px) {
  .header-section {
    background-color: red;
  }
}
```

## ブラウザズーム時にレイアウトが崩れる問題

修正済

#### 問題

- ズームインすると、TabsAndActions の領域がつぶれる

TabsAndActions の領域は 28px あるはずだけど、上記を実行すると 2px くらいになる
原因はリサイズ時になると footer のサイズ分縮めなくてはならないのに計算していないからだとわかった

- まず Header と MainContainer で上下を分割する。Header は 48px 固定で MainContainer は window.innerHeight の残りの部分を占める
- MainContainer の内、Footer が固定で 22px、SplitPane が残りを占める
- PaneSection, EditorSection, PreviewSection はいずれも SplitPane の height:100%になる

はずである

しかしブラウザを拡大すると...

window.innerHeight: 866px

- MainContainer が 866px になる。Header 分を考慮していない
- SplitPane が 844px になる。MainContainer の高さをもとに計算した模様。
- SplitPane に倣って PaneSection, EditorSection, PreviewSection はいずれも SplitPane の height:100%になる
- .monaco-editor は 840px、scrollable-tabs は 4px になった

```
                 default          zoom-in (100% -> 110%)
Root             953px            866px
Header           48px             48px
MainContainer    905px            866px     <-- こいつ。innerHeightをHeaderと分割しなくてはならないのに、Rootと同じ高さになってしまっている
SplitPane        883px            844px
PaneSection      883px            844px
EditorSection    883px            844px
PreviewSection   883px            844px
FooterSection    22px             22px
```

```html
<div id="root">
  <div class="header-section">...</div>
  <div class="main-container">
    <div class="split-pane">
      <div class="pane-container">...</div>
      <div class="editor-seciton">...</div>
      <div class="preview-seciton">...</div>
    </div>
  </div>
  <div class="footer-section">...</div>
</div>
```

```css
#root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  margin: 0;
  color: #e6e6e6;
}

.header-section {
  height: 48px;
  min-height: 48px;
}

.main-container {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;  /* 誤った設定 */
}
```

#### 原因

結局、なんでか知らんけど初期レンダリングの時だけ以下のルールは無視される

`.main-container`の height は`height: 100%`なので、`#root`の height そのままになるはずなんだけど、

初期レンダリング時は`.main-container`の height は`#root`の height - 48px でレンダリングされる。

一方、window リサイズされると`.main-container`の height は急に`height: 100%`のルールを思い出したかのように、たちまち`#root`の height と同値になる

このように、初期レンダリング時には`height: 100%`ルールがなんでか適用されないために修正されなくてはならないものが隠れていた

なのでこれを修正した。

#### 修正 `.main-container`

必ず`rootのheight` - `headerのheight`になるようにする

```diff scss
.main-container {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
- height: 100%;
+ height: calc(100% - 48px);
}
```

#### 修正 `.scrollable-tabs`

window resize 時に`.scrollable-tabs`がつぶされていたので min-height を追加する

```diff scss
.scrollable-tabs {
  height: $monaco-group-tab-height;
+ min-height: $monaco-group-tab-height;
  overflow: hidden;
  display: flex;
}
```

#### 修正 `.monaco-editor`

`height: 100%`に設定されていたため window resize 時に`.editor-sectin`の height と同値になるため、

`.scrollable-tabs`がつぶれたり、画面外へはみ出すためスクロール領域が発生してしまっていた。

```diff scss
.monaco-editor {
+ height: calc(100% - 28px);
- height: 100%;
}
```


## レスポンシブ内容の反映処理

```bash
# 問題なし
src/slices/layoutSlice.ts
src/utils/index.ts
src/sass/main.scss
src/sass/layout/_main.scss
src/sass/components/_tabsAndActions.scss
src/sass/components/_header.scss
src/sass/components/_editor.scss
src/sass/base/_typography.scss
src/sass/base/_base.scss
src/sass/abstracts/_mixins.scss
src/index.html
src/Layout/PaneSection.tsx
src/Layout/MainContainer.tsx
src/Layout/index.tsx
src/Layout/EditorSection.tsx
src/constants/index.ts
src/components/Pane.tsx
src/components/VSCodeExplorer/Workspace/index.tsx
src/components/TabsAndActions/index.tsx
src/components/ScrollableElement/index.tsx
src/components/Monaco/MonacoEditor.tsx
src/components/Modal/index.tsx
src/components/Header/index.tsx

# 変更なし
src/App.tsx

# 新規追加
src/Layout/desktop/index.tsx
src/components/SliderPane.tsx
src/components/sliderPane.css
src/Layout/phone/EditorSection.tsx
src/Layout/phone/PaneSection.tsx
src/Layout/phone/index.tsx
src/Layout/tablet/EditorSection.tsx
src/Layout/tablet/PreviewSection.tsx
src/Layout/tablet/index.tsx
src/utils/limitWithinRange.ts


```
