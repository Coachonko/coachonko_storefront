import { Component } from 'inferno'
import { Link, Redirect } from 'inferno-router'

import { config } from '../../../config'
import { makeCancelable } from '../../utils/promises'
import { isPeonyError } from '../../utils/peony'
import { getPostsByTag, resolveGettingPostsByTag } from '../../utils/data'

export default class Post extends Component {
  static async getInitialData (url) {
    const handle = url.split('/').pop()
    return fetch(`${config.PEONY_STOREFRONT_API}/posts?filter_handle=${handle}`)
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
      postData: initialData
    }
  }

  async componentDidMount () {
    if (this.state.postData === null) {
      if (this.props.latestPosts) {
        // Get postData from InfernoApp
        const matchedPost = await this.matchPost()
        this.setState({ postData: matchedPost }, this.getRelatedPosts)
      } else {
        // Get postData from peony
        // Happens when first request is to /post, user navigates to /post_tag and then back.
        this.gettingPostData = makeCancelable(Post.getInitialData(this.props.match.params.handle))
        await this.resolveGettingPostData()
      }
    }

    // Handle SSR: if postData is an array, transform to object
    if (this.state.postData.length && this.state.postData.length === 1) {
      this.setState({ postData: this.state.postData[0] }, this.getRelatedPosts)
    }
  }

  componentWillUnmount () {
    if (this.gettingPostData) {
      this.gettingPostData.cancel()
    }
  }

  async matchPost () {
    for (const post of this.props.latestPosts) {
      if (post.handle === this.props.match.params.handle) {
        return post
      }
    }
  }

  async resolveGettingPostData () {
    try {
      this.setState({ isFetching: true })
      const response = await this.gettingPostData.promise
      const data = await response.json()
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
        this.setState({ postData: data })
      } else {
        if (data.length === 0) {
          this.setState({ postData: data }) // render method will redirect
        }
        if (data.length === 1) {
          this.setState({ postData: data[0] }, this.getRelatedPosts)
        }
      }
    } catch (err) {
      this.props.setLastError(err)
    } finally {
      this.setState({ isFetching: false })
    }
  }

  // getRelatedPosts gets 5 posts for each tag in this.state.postData.
  // if this.props.postsByTag already contains some posts, it will get some more.
  // if this.props.postsByTag already contains all the needed posts, nothing will be done.
  async getRelatedPosts () {
    if (this.state.postData.tags && this.state.postData.tags.length > 0) {
      if (this.props.postsByTag) {
        for (const tag of this.state.postData.tags) {
          if (!this.props.postsByTag[tag.handle]) {
            this.gettingPostsByTag = makeCancelable(getPostsByTag(tag.id, 'limit=5'))
            await resolveGettingPostsByTag(this, tag.handle)
          }
          if (this.props.postsByTag[tag.handle].length < 5) {
            const offset = this.props.postsByTag[tag.handle].length
            const limit = 5 - offset
            this.gettingPostsByTag = makeCancelable(getPostsByTag(tag.id, `limit=${limit}&offset=${offset}`))
            await resolveGettingPostsByTag(this, tag.handle)
          }
        }
      } else {
        for (const tag of this.state.postData.tags) {
          this.gettingPostsByTag = makeCancelable(getPostsByTag(tag.id, 'limit=5'))
          await resolveGettingPostsByTag(this, tag.handle)
        }
      }
    }
  }

  render () {
    let postData = this.state.postData

    if (postData === null) {
      return null
    }

    if (isPeonyError(postData)) {
      if (postData.code === 404) {
        return <Redirect to='/404' />
      }
    }

    // Handle SSR: if postData is an empty array, redirect to NoMatch
    if (postData.length && postData.length === 0) {
      return <Redirect to='/404' />
    }

    // Handle SSR: if postData is an array with one object, use that object
    if (postData.length && postData.length === 1) {
      postData = postData[0]
    }

    if (this.state.isFetching === true) {
      return (
        <div>
          loading
        </div>
      )
    }

    let primaryTag
    if (postData.tags) {
      primaryTag = postData.tags[0]
    }

    // TODO build an array of 4 related posts, use this.state.postData.tags and this.props.postsByTag
    // Do not include this post in the array.
    let bottomRowPosts

    return (
      <>
        <LeftColumn
          title={postData.title}
          primaryTag={primaryTag}
          publishedAt={postData.publishedAt}
          updatedAt={postData.updatedAt}
        />
        <RightColumn post={postData} />
        <BottomRow relatedPosts={bottomRowPosts} />
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

// Display 4 post previews in a row. Expects an array of 4 Post.
function BottomRow ({ relatedPosts }) {
  return (
    <div>
      <h4>Further reading</h4>
    </div>
  )
}
