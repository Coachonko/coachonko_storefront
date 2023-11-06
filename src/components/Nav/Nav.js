import { Component } from 'inferno'
import { NavLink } from 'inferno-router'

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
              <NavLink to='/'>Home</NavLink>
            </li>
            <li>
              <NavLink to='/about'>About</NavLink>
            </li>
            <li>
              <NavLink to='/contact'>Contact</NavLink>
            </li>
          </ul>
        </nav>

        {this.props.children}
      </>
    )
  }
}
