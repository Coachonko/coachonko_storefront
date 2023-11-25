import { Component } from 'inferno'
import { Switch, Route } from 'inferno-router'

import { Nav, Footer } from './shared'
import { Home } from './Home'
import { About } from './About'
import { Contact } from './Contact'
import { Post } from './Post'
import { NoMatch } from './NoMatch'

export default function Routes (props) {
  return (
    <Switch>
      <PublicRoute
        exact
        path='/'
        renderComponent={(props) =>
          <Home {...props} {...this.props} />}
      />

      <PublicRoute
        exact
        path='/about'
        renderComponent={(props) =>
          <About {...props} {...this.props} />}
      />

      <PublicRoute
        exact
        path='/contact'
        renderComponent={(props) =>
          <Contact {...props} {...this.props} />}
      />

      <PublicRoute
        exact
        path='/post/:handle'
        renderComponent={(props) =>
          <Post {...props} {...this.props} />}
      />

      <PublicRoute renderComponent={(props) => <NoMatch {...props} />} />

    </Switch>
  )
}

class PublicRoute extends Component {
  render () {
    return (
      <>
        <Nav />
        <Route
          {...this.props}
          render={(props) => this.props.renderComponent({ ...props })}
        />
        <Footer />
      </>
    )
  }
}
