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
      homeData: initialData
    }
  }

  async componentDidMount () {
    // Check SSR data set by constructor
    if (this.state.homeData === null) {
      // Check App state
      if (this.props.pages && this.props.pages.home) {
        this.setState({ homeData: this.props.pages.home })
      } else {
        this.gettingHomeData = makeCancelable(Home.getInitialData())
        await this.resolveGettingHomeData()
      }
    } else {
      if (this.props.pages === null || !this.props.pages.home) {
        let newPages = {}
        newPages = {
          ...this.props.pages,
          [this.state.homeData.handle]: this.state.homeData
        }
        this.props.setPages(newPages)
      }
    }

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

  async resolveGettingHomeData () {
    try {
      this.setState({ isFetching: true })
      const response = await this.gettingHomeData.promise
      const data = await response.json()
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
      } else {
        let newPages = {}
        newPages = {
          ...this.props.pages,
          [data.handle]: data
        }
        this.props.setPages(newPages)
        this.setState({ homeData: data })
      }
    } catch (error) {
      this.props.setLastError(error)
    } finally {
      this.setState({ isFetching: false })
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
    return (
      <>
        <Main homeData={this.state.homeData} />

        {/* left sidebar
        <Featured />
        */}

        <Posts postsData={this.props.posts} />

        {/* right sidebar
        <Tags />
        */}
      </>
    )
  }
}

function Main ({ homeData }) {
  if (homeData === null) {
    return null
  }

  return (
    <main>
      <h1>{homeData.title}</h1>
      <span>{homeData.subtitle}</span>
      <div dangerouslySetInnerHTML={{ __html: homeData.content }} />
    </main>
  )
}

function Posts ({ postsData }) {
  const posts = []
  if (postsData) {
    for (const [index, post] of Object.values(postsData).entries()) {
      posts.push(<Post key={index} post={post} />)
    }
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <div className='posts-list'>
      <ol>
        {posts}
      </ol>
      {/* TODO load more automatically when scrolling to bottom */}
    </div>
  )
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
