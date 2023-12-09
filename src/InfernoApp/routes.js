import { AppRoute } from './Routes'

import { Contact } from './Contact'
import { Home } from './Home'
import { NoMatch } from './NoMatch'
import { Page } from './Page'
import { Post } from './Post'
import { PostTag } from './PostTag'

export const routes = [
  {
    exact: true,
    path: '/',
    component: Home,
    wrapper: AppRoute,
    initialData: Home.initialData
  },
  {
    exact: true,
    path: '/contact',
    component: Contact,
    wrapper: AppRoute
    // TODO seo: ContactSEO and use in server.js
  },
  {
    exact: true,
    path: '/page/:handle',
    component: Page,
    wrapper: AppRoute,
    getInitialData: Page.getInitialData
  },
  {
    exact: true,
    path: '/post/:handle',
    component: Post,
    wrapper: AppRoute,
    getInitialData: Post.getInitialData
  },
  {
    exact: true,
    path: '/post_tag/:handle',
    component: PostTag,
    wrapper: AppRoute,
    getInitialData: PostTag.getInitialData
  },
  {
    path: '*',
    component: NoMatch
  }
]
