import { hydrate } from 'inferno-hydrate'
import { BrowserRouter } from 'inferno-router'

import { App } from './components'
import './styles/index.less'

hydrate(
  <BrowserRouter initialData={window.___infernoRouterData}>
    <App />
  </BrowserRouter>
  , document.getElementById('root')
)
