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
        render={(props) => <Home {...props} />}
        loader={Home.getInitialData}
      />

      <Route
        exact
        path='/post/:handle'
        render={(props) => <Post {...props} />}
        loader={Post.getInitialData}
      />

      {/* TODO decide how to load pages, including contact */}
      <Route
        exact
        path='/contact'
        render={(props) => <Contact {...props} />}
      />

      <Route render={(props) => <NoMatch {...props} />} />

    </Switch>
  )
}
