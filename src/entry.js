import { render } from 'inferno'
import { BrowserRouter } from 'inferno-router'

import { InfernoApp } from './components'
import './styles/index.less'

render(
  <BrowserRouter>
    <InfernoApp />
  </BrowserRouter>
  , document.getElementById('root')
)
