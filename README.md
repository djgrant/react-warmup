# react-warmup

A warm up routine to prepare data-dependent apps for server  rendering.

[![npm](https://img.shields.io/npm/v/react-warmup.svg?style=flat-square)](http://npm.im/react-warmup)
[![MIT License](https://img.shields.io/npm/l/react-warmup.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/djgrant/react-warmup.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/redux-quest)

```js
const warmup = require('react-warmup');
const { renderToString } = require('react-dom/server');

warmup(<App />)
  .then(renderToString)
  .then(html => {
    res.render('reactView', { html, state });
  });
```

## Overview

`warmup` is a nonintrusive function that:

- Traverses a provided React tree and calls `componentWillMount` on
every class component it encounters.

- If `componentWillMount` returns a promise, it will wait for the promise to resolve before rendering its children and continuing to traverse the tree.

- Once all those promises have resolved, `warmup(tree)` will then itself resolve with the tree that was originally provided to it.

A few things worth noting:

- `warmup` does not modify the tree or do anything to persist data from one render routine to the next.

- The developer is responsible for getting the app warmed up during the `warmup` routine by, for example, populating a redux store or priming a cache.

- Pausing rendering whenever asynchronous work is taking place in the component means that the app is traversed in its complete state and, critically, deeply nested components are reached during the warm up routine.

## How to use

To prepare your app to be rendered to HTML

- Place asynchronous work inside of `componentWillMount`
- Return a promise
- Store the result to a persistence layer e.g. memcached, lru-cache, redux etc.

```js
// Some kind of persistence layer
var cache = [];

class Posts extends React.Component {
  componentWillMount() {
    // When the app is finally rendered to string the cache should already be primed
    if (cache.length) {
      return;
    }
    // During the warmup routine traversal is paused while asynchronous work is done
    return fetch(POSTS_URL)
      .then(response => response.json())
      .then(posts => {
        this.setState({ posts });
        cache = posts;
      });
  }
  // When the above promise is resolved the child components can be rendered and traversed
  render() {
    var { posts } = this.state;
    return (
      <div>
        {posts
          ? posts.map(post => <Post data={post} />)}
          : <Loading />}
      </div>
    )
  }
}
```
