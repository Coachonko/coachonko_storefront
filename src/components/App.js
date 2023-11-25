import { Component } from 'inferno'

import { makeCancelable } from '../utils/promises'
import { isPeonyError } from '../utils/peony'
import { config } from '../../config'

import { Nav } from './Nav'
import { Routes } from '.'
import { Footer } from './Footer'

export default class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      posts: null,
      featured: null,
      tags: null
    }
  }

  async componentDidMount () {
    this.gettingPosts = makeCancelable(this.getPosts())
    await this.resolveGettingPosts()
  }

  componentWillUnmount () {
    if (this.gettingPosts) {
      this.gettingPosts.cancel()
    }
  }

  // TODO get 10 posts
  async getPosts () {
    try {
      const response = await fetch(`${config.PEONY_STOREFRONT_API}/posts`, {
        method: 'GET'
      })
      const data = await response.json()
      return data
    } catch (error) {
      return error
    }
  }

  async resolveGettingPosts () {
    const data = await this.gettingPosts.promise
    if (data instanceof Error) {
      console.log(data)
      this.setState({ lastError: data })
    } else {
      if (isPeonyError(data)) {
        this.setState({ peonyError: data })
      } else {
        this.setState({ posts: data })
      }
    }
  }

  // TODO get 10 more posts, add to array
  async getNextPosts () {

  }

  async resolveGettingNextPosts () {

  }

  async getFeaturedPosts () {

  }

  async resolveGettingFeaturedPosts () {

  }

  render () {
    return (
      <>
        <Nav />
        <Routes
          posts={this.state.posts}
          featured={this.state.featured}
        />
        <Footer />
      </>
    )
  }
}
