import { Component } from 'inferno'
import { NavLink } from 'inferno-router'

import { config } from '../../../../config'

export default class Nav extends Component {
  constructor (props) {
    super(props)

    this.state = {
      peonyError: null,
      lastError: null
    }
  }

  render () {
    return (
      <>
        <nav>
          <ul>
            <li>
              <NavLink to={`${config.BASE_URL}/`}>Home</NavLink>
            </li>
            <li>
              <NavLink to={`${config.BASE_URL}/about`}>About</NavLink>
            </li>
            <li>
              <NavLink to={`${config.BASE_URL}/contact`}>Contact</NavLink>
            </li>
          </ul>
        </nav>

        {this.props.children}
      </>
    )
  }
}
