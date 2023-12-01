import { Component } from 'inferno'
import { Link, useLoaderData, useLoaderError } from 'inferno-router'

import { config } from '../../../config'
import { isPeonyError } from '../../utils/peony'
import { makeCancelable } from '../../utils/promises'

export default class Home extends Component {
  static async getInitialData ({ request }) {
    return fetch(`${config.PEONY_STOREFRONT_API}/pages/handle/home`, {
      method: 'GET',
      signal: request?.signal
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
    await this.handleLoaderResult(data, err)

    this.gettingPosts = makeCancelable(this.getPosts())
    await this.resolveGettingPosts()
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

  // TODO disable button until new posts have been added
  async getNextPosts () {
    const offset = this.props.posts.length + 10
    try {
      const response = await fetch(`${config.PEONY_STOREFRONT_API}/posts?offset=${offset}`, {
        method: 'GET'
      })
      const data = await response.json()
      return data
    } catch (error) {
      return error
    }
  }

  async resolveGettingNextPosts () {
    const data = await this.gettingNextPosts.promise
    if (data instanceof Error) {
      this.props.setLastError(data)
    } else {
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
      } else {
        const newPostsArray = [...this.props.posts, ...data]
        this.props.setPosts(newPostsArray)
      }
    }
  }

  // TODO peony API support for filter
  async getFeaturedPosts () {
    try {
      const response = await fetch(`${config.PEONY_STOREFRONT_API}/posts?filter=featured}`, {
        method: 'GET'
      })
      const data = await response.json()
      return data
    } catch (error) {
      return error
    }
  }

  async resolveGettingFeaturedPosts () {
    const data = await this.gettingFeaturedPosts.promise
    if (data instanceof Error) {
      this.props.setLastError(data)
    } else {
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
      } else {
        this.props.setFeatured(data)
      }
    }
  }

  render () {
    let posts
    if (this.props.posts) {
      posts = Object.values(this.props.posts).map((post, index) => {
        return <Post key={index} post={post} />
      })
    }

    return (
      <>
        <div>
          <h1>Coachonko's blog</h1>
        </div>

        {/* left sidebar
        <Featured />
        */}

        <div className='posts-list'>
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
