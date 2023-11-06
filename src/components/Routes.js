import { Switch, Route } from 'inferno-router'

import { Home } from './Home'
import { About } from './About'
import { Contact } from './Contact'
import { Post } from './Post'
import { NoMatch } from './NoMatch'

export default function Routes (props) {
  return (
    <Switch>
      <Route
        exact
        path='/'
        render={(props) =>
          <Home {...props} {...this.props} />}
      />

      <Route
        exact
        path='/about'
        render={(props) =>
          <About {...props} {...this.props} />}
      />

      <Route
        exact
        path='/contact'
        render={(props) =>
          <Contact {...props} {...this.props} />}
      />

      <Route
        exact
        path='/post/:id'
        render={(props) =>
          <Post {...props} {...this.props} />}
      />

      <Route render={(props) => <NoMatch {...props} />} />

    </Switch>
  )
}
