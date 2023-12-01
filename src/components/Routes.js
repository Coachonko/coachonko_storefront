import { Component } from 'inferno'
import { Switch, Route } from 'inferno-router'

import { Navigation } from './shared'
import { Post } from './Post'
import { Home } from './Home'
import { NoMatch } from './NoMatch'

export default function Routes (props) {
  return (
    <Switch>
      <AppRoute
        exact
        path='/'
        renderComponent={(props) =>
          <Home {...props} {...this.props} />}
        loader={Home.getInitialData}
      />

      <AppRoute
        exact
        path='/post/:handle'
        renderComponent={(props) =>
          <Post {...props} {...this.props} />}
        loader={Post.getInitialData}
      />

      <AppRoute renderComponent={(props) =>
        <NoMatch {...props} {...this.props} />}
      />
    </Switch>
  )
}

class AppRoute extends Component {
  render () {
    return (
      <div className='app-route-container'>
        <Navigation>
          <Route
            {...this.props}
            render={(props) => this.props.renderComponent({ ...props })}
          />
        </Navigation>
      </div>
    )
  }
}
