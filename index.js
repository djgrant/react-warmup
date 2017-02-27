const React = require('react');

module.exports = function warmup (tree) {
  return traverse(tree).then(() => tree);
}

// Recurse React element tree awaiting promises returned from component will mount
// React introsoection based on https://github.com/apollostack/react-apollo/blob/master/src/server.ts
async function traverse(element, context = {}) {
  // Is this element a Component?
  if (typeof element.type === 'function') {
    const Component = element.type;
    const props = Object.assign({}, Component.defaultProps, element.props);
    let childContext = context;
    let child;

    // Is this a class component? (http://bit.ly/2j9Ifk3)
    const isReactClassComponent = Component.prototype &&
      (Component.prototype.isReactComponent ||
        Component.prototype.isPureReactComponent);

    if (isReactClassComponent) {
      const instance = new Component(props, context);
      // In case the user doesn't pass these to super in the constructor
      instance.props = instance.props || props;
      instance.context = instance.context || context;

      // Make the setState synchronous.
      instance.setState = newState => {
        instance.state = Object.assign({}, instance.state, newState);
      };

      // Call componentWillMount if it exists.
      if (instance.componentWillMount) {
        // If componentWillMount returns a promise wait for it to resolve
        await instance.componentWillMount();
      }

      // Ensure the child context is initialised if it is available. We will
      // need to pass it down the tree.
      if (instance.getChildContext) {
        childContext = Object.assign({}, context, instance.getChildContext());
      }

      // Get the render output as the child.
      child = instance.render();
    }

    else {
      // Stateless Functional Component
      // Get the output for the function, as the child.
      child = Component(props, context);
    }

    if (child) {
      return traverse(child, childContext);
    }
  }
  // This must be a basic element, such as a string or dom node.
  // If the element has children then we will walk them.
  else {
    if (element.props && element.props.children) {
      return Promise.all(
        React.Children.map(element.props.children, child => {
          if (child) {
            return traverse(child, context);
          }
          return;
        })
      )
    }
  }

  return;
}
