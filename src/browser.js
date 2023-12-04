import { hydrate } from 'inferno-hydrate'
import { BrowserRouter } from 'inferno-router'

import { InfernoApp } from './InfernoApp'
import './styles/index.less'

hydrate(
  <BrowserRouter>
    <InfernoApp />
  </BrowserRouter>
  , document.getElementById('root')
)
