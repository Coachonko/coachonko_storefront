import { Component } from 'inferno'
import { Link } from 'inferno-router'

import { config } from '../../../config'
import { isPeonyError } from '../../utils/peony'
import { makeCancelable } from '../../utils/promises'

export default class Home extends Component {
  static async getInitialData () {
    return fetch(`${config.PEONY_STOREFRONT_API}/posts/handle/home`, {
      method: 'GET'
    })
  }

  constructor (props) {
    super(props)

    this.state = {
      isFetching: true,
      homeData: null
    }
  }

  async componentDidMount () {
    this.gettingPosts = makeCancelable(this.getPosts())
    await this.resolveGettingPosts()

    this.getingFeaturedPosts = makeCancelable(this.getFeaturedPosts())
    await this.resolveGettingFeaturedPosts()
  }

  componentWillUnmount () {
    if (this.gettingPosts) {
      this.gettingPosts.cancel()
    }
  }

  async getPosts () {
    const response = await fetch(`${config.PEONY_STOREFRONT_API}/posts`, {
      method: 'GET'
    })
    const data = await response.json()
    return data
  }

  async resolveGettingPosts () {
    try {
      this.setState({ isFetching: true })
      const data = await this.gettingPosts.promise
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
      } else {
        this.props.setPosts(data)
      }
    } catch (error) {
      this.props.setLastError(error)
    } finally {
      this.setState({ isFetching: false })
    }
  }

  async getNextPosts () {
    const offset = this.props.posts.length + 10
    const response = await fetch(`${config.PEONY_STOREFRONT_API}/posts?offset=${offset}`, {
      method: 'GET'
    })
    const data = await response.json()
    return data
  }

  async resolveGettingNextPosts () {
    try {
      this.setState({ isFetching: true })
      const data = await this.gettingNextPosts.promise
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
      } else {
        const newPostsArray = [...this.props.posts, ...data]
        this.props.setPosts(newPostsArray)
      }
    } catch (error) {
      this.props.setLastError(error)
    } finally {
      this.setState({ isFetching: false })
    }
  }

  // TODO create a featured tag using the admin frontend, add id to config.
  // Less efficient method: get list of tags, find the tag with handle featured and use its id.
  async getFeaturedPosts () {
    const response = await fetch(`${config.PEONY_STOREFRONT_API}/posts?filter_tags=${config.FEATURED_TAG_ID}`, {
      method: 'GET'
    })
    const data = await response.json()
    return data
  }

  async resolveGettingFeaturedPosts () {
    try {
      this.setState({ isFetching: true })
      const data = await this.gettingFeaturedPosts.promise
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
      } else {
        this.props.setFeatured(data)
      }
    } catch (error) {
      this.props.setLastError(error)
    } finally {
      this.setState({ isFetching: false })
    }
  }

  render () {
    const homeData = this.props.initialData

    let posts
    if (this.props.posts) {
      posts = Object.values(this.props.posts).map((post, index) => {
        return <Post key={index} post={post} />
      })
    }

    return (
      <>
        <Main homeData={homeData} />

        {/* left sidebar
        <Featured />
        */}

        <div className='posts-list'>
          <ol>
            {posts}
          </ol>
          {/* TODO load more automatically when scrolling to bottom */}
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

function Main ({ homeData }) {
  if (!homeData) {
    return null
  }

  return (
    <main>
      <h1>{homeData.title}</h1>
      <span>{homeData.description}</span>
      <div dangerouslySetInnerHTML={{ __html: homeData.content }} />
    </main>
  )
}
