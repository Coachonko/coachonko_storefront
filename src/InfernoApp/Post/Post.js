import { Component } from 'inferno'
import { Link } from 'inferno-router'

import { config } from '../../../config'
import { makeCancelable } from '../../utils/promises'
import { isPeonyError } from '../../utils/peony'

export default class Post extends Component {
  static async getInitialData (url) {
    const handle = url.split('/').pop()
    return fetch(`${config.PEONY_STOREFRONT_API}/posts/handle/${handle}`)
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
      postData: initialData
    }
  }

  async componentDidMount () {
    if (this.state.postData === null) {
      // Get postData from InfernoApp if available
      if (this.props.latestPosts) {
        let matchedPost
        for (const post of this.props.latestPosts) {
          if (post.handle === this.props.match.params.handle) {
            matchedPost = post
            break
          }
        }
        this.setState({ postData: matchedPost })
      } else {
        // Get postData from peony
        this.gettingPostData = makeCancelable(Post.getInitialData(this.props.match.params.handle))
        await this.resolveGettingPostData()
      }
    }
  }

  componentWillUnmount () {
    if (this.gettingPostData) {
      this.gettingPostData.cancel()
    }
  }

  async resolveGettingPostData () {
    try {
      this.setState({ isFetching: true })
      const response = await this.gettingPostData.promise
      const data = await response.json()
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
      } else {
        this.setState({ postData: data })
      }
    } catch (err) {
      this.props.setLastError(err)
    } finally {
      this.setState({ isFetching: false })
    }
  }

  render () {
    if (this.state.postData === null) {
      return null
    }

    if (this.state.isFetching === true) {
      return (
        <div>
          loading
        </div>
      )
    }

    let primaryTag
    if (this.state.postData.tags) {
      primaryTag = this.state.postData.tags[0]
    }
    return (
      <>
        <LeftColumn
          title={this.state.postData.title}
          primaryTag={primaryTag}
        />
        <RightColumn post={this.state.postData} />
        <BottomRow
          postsByTag={this.props.postsByTag}
          primaryTag={primaryTag}
        />
      </>
    )
  }
}

function LeftColumn ({ title, primaryTag }) {
  let primaryTagLink
  if (primaryTag) {
    primaryTagLink = <Link to={`${config.BASE_URL}/post_tag/${primaryTag.handle}`}>{primaryTag.title}</Link>
  }

  return (
    <div>
      <h1>{title}</h1>
      {primaryTagLink}
    </div>
  )
}

function RightColumn ({ post }) {
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />

    </div>
  )
}

function BottomRow () {
  return (
    <div>
      <h4>Further reading</h4>
    </div>
  )
}
