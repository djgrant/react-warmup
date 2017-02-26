# react-warmup

```js
const { renderToString } = require('react-dom/server');

warmup(<App />)
  .then(renderToString)
  .then(html => {
    res.render('reactView', { html, state });
  });
```

`warmup` traverses a provided React tree and calls componentWillMount on 
every class component it encounters.

If componentWillMount returns a promise, it will wait for the promise to resolve 
before continuing to traverse the tree.

Once all those promises have resolved  `warmup(tree)` itself resolves with the
tree that was provided to it. 
