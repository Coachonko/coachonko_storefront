import { Component } from 'inferno'
import { Redirect } from 'inferno-router'

import { config } from '../../../config'
import { makeCancelable } from '../../utils/promises'
import { getPostsByTag, resolveGettingPostsByTag, retrieveInitialData } from '../../utils/data'
import { isPeonyError } from '../../utils/peony'

export default class PostTag extends Component {
  static async getInitialData (url) {
    const handle = url.split('/').pop()
    return fetch(`${config.PEONY_STOREFRONT_API}/post_tags?filter_handle=${handle}`)
  }

  constructor (props) {
    super(props)

    const initialData = retrieveInitialData(this.props.staticContext)

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

    // Handle SSR: if postTagData is an array, transform to object
    if (this.state.postTagData.length && this.state.postTagData.length === 1) {
      this.setState({ postTagData: this.state.postTagData[0] }, this.getNeededPosts)
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
    let postTagData = this.state.postTagData

    if (postTagData === null) {
      return null
    }

    if (isPeonyError(postTagData)) {
      this.props.setPeonyError(postTagData)
      // TODO handle error differently?
      return <Redirect to='/404' />
    }

    // Handle SSR: if postTagData is an empty array, redirect to NoMatch
    if (postTagData.length && postTagData.length === 0) {
      return <Redirect to='/404' />
    }

    // Handle SSR: if postTagData is an array with one object, use that object
    if (postTagData.length && postTagData.length === 1) {
      postTagData = postTagData[0]
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
          {JSON.stringify(postTagData)}
        </div>
      </>
    )
  }
}
