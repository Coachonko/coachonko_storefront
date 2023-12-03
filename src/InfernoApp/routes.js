import { AppRoute } from './Routes'

import { Post } from './Post'
import { Home } from './Home'
import { NoMatch } from './NoMatch'

export const routes = [
  {
    exact: true,
    path: '/',
    component: Home,
    wrapper: AppRoute,
    getInitialData: Home.getInitialData
  },
  {
    exact: true,
    path: '/post/:handle',
    component: Post,
    wrapper: AppRoute,
    getInitialData: Post.getInitialData
  },
  {
    path: '*',
    component: NoMatch
  }
]
