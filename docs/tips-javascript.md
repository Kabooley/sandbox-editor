# Note: Tips of JavaScript

## Properties comparision of two object

https://stackoverflow.com/questions/1068834/object-comparison-in-javascript

## Debounce

https://lodash.com/docs/4.17.15#debounce

https://css-tricks.com/debouncing-throttling-explained-examples/

https://www.freecodecamp.org/news/javascript-debounce-example/

What is `debounce` ?

例えばキーボードの`a`キーを押すとする。ユーザがキーを押してから離すまでの間に、実は「`a`キーが押されている」という信号が何度も送信される。この何度も信号を受け取る必要がないように、一度その信号が送信されたら他の同じ信号をあらかじめ決めた時間だけ無視するようにする機能のこと。

JavaScript の例でいえば、ユーザがフォームで入力したときに入力内容に応じて検索クエリを送信する仕組みがあるとして、ある程度の入力があってからクエリを送信するために入力中一定期間タイプ内容を無視するようにする機能とか？

今回の開発の例でいえば：

-   エディタの入力内容を捉えてバンドリングする場合、debounced することで入力内容がある程度時間をおいてからバンドリングリクエストを送信できるのでリクエストの数を節約できる

-   ウィンドウのリサイズの調整再計算機能を debounce すれば resize イベント全てに反応しないけれど一定間隔ごとに実行できる。

例：

```JavaScript
function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
function saveInput(){
  console.log('Saving data');
}
const processChange = debounce(() => saveInput());
```

```HTML
<!-- Debounced -->
<input type="text" onkeyup="processChange()" />

<!-- Not debounced -->
<input type="text" onkeyup="saveInput()" />
```

Debounced の例ならば 300 ミリ秒まってから saveInput()が呼び出されるが、

not debounced の例だと常にイベントが発生すると呼び出されるので

呼出の回数が異なる。


## Compare two objects

https://stackoverflow.com/questions/1068834/object-comparison-in-javascript