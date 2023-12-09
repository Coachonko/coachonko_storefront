import { Component } from 'inferno'
import { Link, Redirect } from 'inferno-router'

import { config } from '../../../config'
import { makeCancelable } from '../../utils/promises'
import { isPeonyError, getPostsByTag } from '../../utils/peony'
import { resolveGettingPostsByTag } from '../../utils/data'

export default class PostTag extends Component {
  static async getInitialData (url) {
    const handle = url.split('/').pop()
    return fetch(`${config.PEONY_STOREFRONT_API}/post_tags/handle/${handle}`)
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
        let matchedPostTag
        for (const postTag of this.props.postTags) {
          if (postTag.handle === this.props.match.params.handle) {
            matchedPostTag = postTag
            break
          }
        }
        this.setState({ postTagData: matchedPostTag })
      } else {
        // Get postTagData from peony
        this.gettingPostTagData = makeCancelable(PostTag.getInitialData(this.props.match.params.handle))
        await this.resolveGettingPostTagData()
      }
    }
  }

  async componentDidUpdate (lastProps, lastState) {
    if (lastState.postTagData === null && this.state.postTagData) {
      if (!this.props.postsByTag[this.state.postTagData.handle]) {
        this.gettingPostsByTag = makeCancelable(getPostsByTag(this.state.postTagData.id, 'limit=10'))
        await resolveGettingPostsByTag(this, this.state.postTagData.handle)
      }
    }
  }

  componentWillUnmount () {
    if (this.gettingPostTagData) {
      this.gettingPostTagData.cancel()
    }
  }

  async resolveGettingPostTagData () {
    try {
      this.setState({ isFetching: true })
      const response = await this.gettingPostTagData.promise
      const data = await response.json()
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
      } else {
        this.setState({ postTagData: data })
      }
    } catch (error) {
      this.props.setLastError(error)
    } finally {
      this.setState({ isFetching: false })
    }
  }

  render () {
    if (this.state.postTagData === null) {
      return null
    }

    if (isPeonyError(this.state.postTagData)) {
      if (this.state.postTagData.code === 404) {
        return <Redirect to='/404' />
      }
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
