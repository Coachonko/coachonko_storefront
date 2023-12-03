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
      posts: null,
      featured: null,
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
          // Posts
          posts={this.state.posts}
          setPosts={(newPosts) => this.updateAppState('posts', newPosts)}
          featured={this.state.featured}
          setFeatured={(newFeatured) => this.updateAppState('featured', newFeatured)}
          postTags={this.state.postTags}
          setPostTags={(newPostTags) => this.updateAppState('postTags', newPostTags)}
          // shared
          setPeonyError={(newPeonyError) => this.updateAppState('peonyError', newPeonyError)}
          setLastError={(newLastError) => this.updateAppState('lastError', newLastError)}
        />
      </>
    )
  }
}
