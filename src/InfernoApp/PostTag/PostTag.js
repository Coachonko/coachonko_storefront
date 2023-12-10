import { Component } from 'inferno'
import { Redirect } from 'inferno-router'

import { config } from '../../../config'
import { makeCancelable } from '../../utils/promises'
import { getPostsByTag } from '../../utils/peony'
import { resolveGettingPostsByTag } from '../../utils/data'

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
        initialData = window.___initialData
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
        await this.matchPostTag()
      } else {
        // Get postTagData from peony
        // Happens when first request is /post and user clicks on Link to /post_tag.
        await this.props.fetchPostTags()
        await this.matchPostTag()
      }
    }
  }

  async matchPostTag () {
    let matchedPostTag
    for (const postTag of this.props.postTags) {
      if (postTag.handle === this.props.match.params.handle) {
        matchedPostTag = postTag
        break
      }
    }
    this.setState({ postTagData: matchedPostTag }, async () => {
      if (!this.props.postsByTag[this.state.postTagData.handle]) {
        this.gettingPostsByTag = makeCancelable(getPostsByTag(this.state.postTagData.id, 'limit=10'))
        await resolveGettingPostsByTag(this, this.state.postTagData.handle)
      }
    })
  }

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
