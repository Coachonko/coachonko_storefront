// import { Component } from 'inferno'
import { Switch, Route } from 'inferno-router'

// import { Nav, Footer } from './shared'
import { Post } from './Post'
import { Contact } from './Contact'
import { Home } from './Home'
import { NoMatch } from './NoMatch'

export default function Routes (props) {
  return (
    <Switch>
      <Route
        exact
        path='/'
        render={(props) => <Home {...this.props} {...props} loader={Home.loadHome} />}
        // https://github.com/infernojs/inferno/blob/30bd8f17e8ec3441f1cf1007a9cd2e69896669a0/demo/inferno-router-demo/src/App.tsx#L26
        // component={Home} loader={Home.loadHome}
        // Uncommeting this line causes the component to not render at all.
      />

      <Route
        exact
        path='/post/:handle'
        render={(props) => <Post {...this.props} {...props} loader={Post.loadPost} />}
      />

      {/* TODO decide how to load pages, including contact */}
      <Route
        exact
        path='/contact'
        render={(props) => <Contact {...this.props} {...props} />}
      />

      <Route render={(props) => <NoMatch {...this.props} {...props} />} />

    </Switch>
  )
}
