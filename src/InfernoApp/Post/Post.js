import { Component } from 'inferno'
import { Link, Redirect } from 'inferno-router'

import { config } from '../../../config'
import { makeCancelable } from '../../utils/promises'
import { isPeonyError } from '../../utils/peony'

export default class Post extends Component {
  static async getInitialData (url) {
    const handle = url.split('/').pop()
    return fetch(`${config.PEONY_STOREFRONT_API}/posts/handle/${handle}`, {
      method: 'GET'
    })
  }

  constructor (props) {
    super(props)

    let initialData
    if (typeof window === 'undefined') {
      initialData = this.props.staticContext.initialData
    } else {
      if (window.___initialData) {
        initialData = window.___initialData
        delete window.___initialData
      } else {
        initialData = null
      }
    }

    this.state = {
      isFetching: false,
      postData: initialData
    }
  }

  async componentDidMount () {
    if (this.state.postData === null) {
      if (this.props.latestPosts) {
        const matchedPost = this.props.latestPosts.find(post => post.handle === this.props.match.params.handle)
        this.setState({ postData: matchedPost })
      } else {
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
    } catch (error) {
      this.props.setLastError(error)
    } finally {
      this.setState({ isFetching: false })
    }
  }

  render () {
    if (this.state.peonyError) {
      if (this.state.peonyError.code === 404) {
        return <Redirect to='/404' />
      }
    }

    if (this.state.postData) {
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
          <BottomRow />
        </>
      )
    } else {
      return (
        <div>
          loading
        </div>
      )
    }
  }
}

function LeftColumn ({ title, primaryTag }) {
  let primaryTagLink
  if (primaryTag) {
    primaryTagLink = <Link to={`/tags/${primaryTag.id}`}>{primaryTag.title}</Link>
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
