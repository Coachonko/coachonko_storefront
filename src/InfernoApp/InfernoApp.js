import { Component } from 'inferno'

import { config } from '../../config'
import { isPeonyError } from '../utils/peony'

import { Alerts } from './shared'
import { Routes } from './Routes'
import { makeCancelable } from '../utils/promises'

// InfernoApp keeps the state of the children component, children components will lift the state to App.
// This is to prevent unnecessary requests to the server when users request already provided resources.
export default class InfernoApp extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isFetching: false,
      lastError: null,
      peonyError: null,
      pages: null,
      latestPosts: null,
      postsByTag: null,
      postTags: null
    }

    this.updateAppState = this.updateAppState.bind(this)
    this.fetchPostTags = this.fetchPostTags.bind(this)
  }

  updateAppState (key, value) {
    this.setState({ [key]: value })
  }

  componentWillUnmount () {
    if (this.gettingPostTags) {
      this.gettingPostTags.cancel()
    }
  }

  async fetchPostTags () {
    this.gettingPostTags = makeCancelable(this.getPostTags())
    try {
      this.setState({ isFetching: true })
      const data = await this.gettingPostTags.promise
      if (isPeonyError(data)) {
        this.setState({ peonyError: data })
      } else {
        this.setState({ postTags: data })
      }
    } catch (error) {
      this.setState({ lastError: error })
    } finally {
      this.setState({ isFetching: false })
    }
  }

  async getPostTags () {
    const response = await fetch(`${config.PEONY_STOREFRONT_API}/post_tags`, {
      method: 'GET'
    })
    const data = await response.json()
    return data
  }

  render () {
    return (
      <>
        <Alerts
          lastError={this.state.lastError}
          peonyError={this.state.peonyError}
        />
        <Routes
          // state
          isFetching={this.state.isFetching}
          // Pages
          pages={this.state.pages}
          setPages={(newPages) => this.updateAppState('pages', newPages)}
          // Posts
          latestPosts={this.state.latestPosts}
          setLatestPosts={(newLatestPosts) => this.updateAppState('latestPosts', newLatestPosts)}
          postsByTag={this.state.postsByTag}
          setPostsByTag={(newPostsByTag) => this.updateAppState('postsByTag', newPostsByTag)}
          postTags={this.state.postTags}
          setPostTags={(newPostTags) => this.updateAppState('postTags', newPostTags)} // deprecated
          fetchPostTags={this.fetchPostTags}
          // errors
          setPeonyError={(newPeonyError) => this.updateAppState('peonyError', newPeonyError)}
          setLastError={(newLastError) => this.updateAppState('lastError', newLastError)}
        />
      </>
    )
  }
}
