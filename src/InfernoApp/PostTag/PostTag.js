import { Component } from 'inferno'
import { Redirect } from 'inferno-router'

import { config } from '../../../config'
import { makeCancelable } from '../../utils/promises'
import { getPostsByTag, resolveGettingPostsByTag } from '../../utils/data'

export default class PostTag extends Component {
  static async getInitialData (url) {
    const handle = url.split('/').pop()
    return fetch(`${config.PEONY_STOREFRONT_API}/post_tags?filter_handle=${handle}`)
  }

  constructor (props) {
    super(props)

    let initialData = null
    if (typeof window === 'undefined') {
      initialData = this.props.staticContext.initialData
    } else {
      if (window.___initialData) {
        // TODO check if server sends a peonyError
        initialData = window.___initialData[0]
        delete window.___initialData
      }
    }

    this.state = {
      isFetching: false,
      postTagData: initialData
    }
  }

  async componentDidMount () {
    if (this.state.postTagData === null) {
      // Get postTagData from InfernoApp if available
      if (this.props.postTags) {
        const matchedPostTag = await this.matchPostTag()
        this.setState({ postTagData: matchedPostTag }, this.getNeededPosts)
      } else {
        // Get postTagData from peony
        // Happens when first request is /post and user clicks on Link to /post_tag.
        await this.props.fetchPostTags()
        const matchedPostTag = await this.matchPostTag()
        this.setState({ postTagData: matchedPostTag }, this.getNeededPosts)
      }
    }
  }

  async matchPostTag () {
    for (const postTag of this.props.postTags) {
      if (postTag.handle === this.props.match.params.handle) {
        return postTag
      }
    }
  }

  // getNeededPosts gets 10 Post for the needed PostTag.
  // If this.props.postsByTag contains some posts already, the missing ones are fetched.
  async getNeededPosts () {
    const postsByTag = this.props.postsByTag
    const postTagData = this.state.postTagData
    if (postsByTag === null || !postsByTag[postTagData.handle]) {
      this.gettingPostsByTag = makeCancelable(getPostsByTag(postTagData.id, 'limit=10'))
      await resolveGettingPostsByTag(this, postTagData.handle)
    }
    if (
      postsByTag &&
      postsByTag[postTagData.handle] &&
      postsByTag[postTagData.handle].length > 0 &&
      postsByTag[postTagData.handle].length < 10) {
      const offset = postsByTag[postTagData.handle].length
      const limit = 10 - offset
      this.gettingPostsByTag = makeCancelable(getPostsByTag(postTagData.id, `limit=${limit}&offset${offset}`))
    }
  }

  // TODO get more posts

  render () {
    if (this.state.postTagData === null) {
      return null
    }

    if (this.state.postTagData.length === 0) {
      return <Redirect to='/404' />
    }

    if (this.state.isFetching === true) {
      return (
        <div>
          loading
        </div>
      )
    }

    // TODO display list of posts in this tag
    return (
      <>
        <div>
          {JSON.stringify(this.state.postTagData)}
        </div>
      </>
    )
  }
}
