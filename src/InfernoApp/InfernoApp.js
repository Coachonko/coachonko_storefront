import { Component } from 'inferno'

import { Alerts } from './shared'
import { Routes } from './Routes'

// InfernoApp keeps the state of the children component, children components will lift the state to App.
// This is to prevent unnecessary requests to the server when users request already provided resources.
export default class InfernoApp extends Component {
  constructor (props) {
    super(props)

    this.state = {
      lastError: null,
      peonyError: null,
      pages: null,
      latestPosts: null,
      postsByTag: null,
      postTags: null
    }

    this.updateAppState = this.updateAppState.bind(this)
  }

  updateAppState (key, value) {
    this.setState({ [key]: value })
  }

  render () {
    return (
      <>
        <Alerts
          lastError={this.state.lastError}
          peonyError={this.state.peonyError}
        />
        <Routes
          // SSR data
          initialData={this.props.initialData}
          // Pages
          pages={this.state.pages}
          setPages={(newPages) => this.updateAppState('pages', newPages)}
          // Posts
          latestPosts={this.state.latestPosts}
          setLatestPosts={(newLatestPosts) => this.updateAppState('latestPosts', newLatestPosts)}
          postsByTag={this.state.postsByTag}
          setPostsByTag={(newPostsByTag) => this.updateAppState('postsByTag', newPostsByTag)}
          postTags={this.state.postTags}
          setPostTags={(newPostTags) => this.updateAppState('postTags', newPostTags)}
          // errors
          setPeonyError={(newPeonyError) => this.updateAppState('peonyError', newPeonyError)}
          setLastError={(newLastError) => this.updateAppState('lastError', newLastError)}
        />
      </>
    )
  }
}
