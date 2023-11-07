import { Component } from 'inferno'
import { Link, Redirect } from 'inferno-router'

import { config } from '../../../config'
import { makeCancelable } from '../../utils/promises'
import { isPeonyError } from '../../utils/peony'

export default class Post extends Component {
  constructor (props) {
    super(props)

    this.state = {
      lastError: null,
      peonyError: null,
      post: null
    }
  }

  async componentDidMount () {
    if (this.props.posts) {
      const matchedPost = this.props.posts.find(post => post.handle === this.props.match.params.handle)
      this.setState({ post: matchedPost })
    } else {
      this.gettingPostData = makeCancelable(this.getPostData())
      await this.resolveGettingPostData()
    }
  }

  componentWillUnmount () {
    if (this.gettingPostData) {
      this.gettingPostData.cancel()
    }
  }

  async getPostData () {
    try {
      const endpoint = `${config.PEONY_STOREFRONT_API}/posts/handle/${this.props.match.params.handle}`
      const response = await fetch(endpoint, {
        method: 'GET'
      })
      const data = await response.json()
      return data
    } catch (error) {
      return error
    }
  }

  async resolveGettingPostData () {
    try {
      const data = await this.gettingPostData.promise
      if (data instanceof Error) {
        console.error(data)
        this.setState({ lastError: data })
      } else {
        if (isPeonyError(data)) {
          this.setState({ peonyError: data })
        } else {
          this.setState({ post: data })
        }
      }
    } catch (error) {
      console.error(error)
      this.setState({ lastError: error })
    }
  }

  render () {
    if (this.state.peonyError) {
      if (this.state.peonyError.code === 404) {
        return <Redirect to='/404' />
      }
    }

    if (this.state.post) {
      let primaryTag
      if (this.state.post.tags) {
        primaryTag = this.state.post.tags[0]
      }

      return (
        <>
          <LeftColumn
            title={this.state.post.title}
            primaryTag={primaryTag}
          />
          <RightColumn post={this.state.post} />
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
