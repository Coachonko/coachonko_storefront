import { Component } from 'inferno'
import { Link, useLoaderData, useLoaderError } from 'inferno-router'

import { config } from '../../../config'
import { isPeonyError } from '../../utils/peony'
import { makeCancelable } from '../../utils/promises'

export default class Home extends Component {
  static async getInitialData ({ req }) {
    return fetch(`${config.PEONY_STOREFRONT_API}/pages/handle/home`, {
      method: 'GET',
      signal: req?.signal
    })
  }

  constructor (props) {
    super(props)

    this.state = {
      temp: null
    }
  }

  async componentDidMount () {
    const data = useLoaderData(this.props)
    const err = useLoaderError(this.props)
    console.log(data, err) // TODO remove
    if (data || err) {
      await this.handleLoaderResult(data, err)
    } else {
      this.gettingPosts = makeCancelable(this.getPosts())
      await this.resolveGettingPosts()
    }
  }

  componentWillUnmount () {
    if (this.gettingPosts) {
      this.gettingPosts.cancel()
    }
  }

  async handleLoaderResult (data, err) {
    if (err) {
      this.props.setLastError(err)
    }
    if (isPeonyError(data)) {
      this.props.setPeonyError(data)
    } else {
      this.props.setPosts(data)
    }
  }

  async getPosts () {
    try {
      const response = await fetch(`${config.PEONY_STOREFRONT_API}/posts`, {
        method: 'GET'
      })
      const data = await response.json()
      return data
    } catch (error) {
      return error
    }
  }

  async resolveGettingPosts () {
    const data = await this.gettingPosts.promise
    if (data instanceof Error) {
      this.props.setLastError(data)
    } else {
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
      } else {
        this.props.setPosts(data)
      }
    }
  }

  // TODO get 10 more posts, add to array
  async getNextPosts () {

  }

  async resolveGettingNextPosts () {

  }

  async getFeaturedPosts () {

  }

  async resolveGettingFeaturedPosts () {

  }

  render () {
    let posts
    if (this.props.posts) {
      posts = Object.values(this.props.posts).map((post, index) => {
        return (
          <Post key={index} post={post} />
        )
      }
      )
    }

    return (
      <>
        <div>
          <h1>Coachonko's blog</h1>
        </div>

        {/* left sidebar
        <Featured />
        */}

        <div>
          <ol>
            {posts}
          </ol>
        </div>

        {/* right sidebar
        <Tags />
        */}
      </>
    )
  }
}

function Post ({ key, post }) {
  let tag
  if (post.tags.length > 0) {
    const primaryTag = post.tags[0]
    tag = <Link to={`/tag/${primaryTag.handle}`}>{primaryTag.title}</Link>
  }

  const updatedAt = new Date(post.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })

  return (
    <li key={key}>
      <Link to={`/post/${post.handle}`}>
        <div>
          {tag}
          <h3>{post.title}</h3>
        </div>
        <div dangerouslySetInnerHTML={{ __html: post.excerpt }} />
        <div>
          {updatedAt}
        </div>
      </Link>
    </li>
  )
}
