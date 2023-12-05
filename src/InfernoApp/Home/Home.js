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

    if (this.props.posts === null) {
      this.gettingPosts = makeCancelable(this.getPosts())
      await this.resolveGettingPosts()
    }

    if (this.props.postTags === null) {
      this.gettingPostTags = makeCancelable(this.getPostTags())
      await this.resolveGettingPostTags()
    } else {
      // featured posts can be fetched now.
      if (this.props.featured === null) {
        const tagHandle = 'featured'
        const featuredId = this.getPostTagId(tagHandle)
        if (featuredId) {
          this.gettingPostsByTag = makeCancelable(this.getPostsByTag(featuredId))
          await this.resolveGettingPostsByTag(tagHandle)
        }
      }
    }
  }

  async componentDidUpdate (lastProps) {
    // fetch featured posts as soon as postTags is available
    if (lastProps.postTags === null && this.props.postTags) {
      const tagHandle = 'featured'
      const featuredId = this.getPostTagId(tagHandle)
      if (featuredId) {
        this.gettingPostsByTag = makeCancelable(this.getPostsByTag(featuredId))
        await this.resolveGettingPostsByTag(tagHandle)
      }
    }
  }

  componentWillUnmount () {
    if (this.gettingPosts) {
      this.gettingPosts.cancel()
    }
    if (this.gettingPostTags) {
      this.gettingPostTags.cancel()
    }
    if (this.gettingPostsByTag) {
      this.gettingPostsByTag.cancel()
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

  async getPostTags () {
    const response = await fetch(`${config.PEONY_STOREFRONT_API}/post_tags`, {
      method: 'GET'
    })
    const data = await response.json()
    return data
  }

  async resolveGettingPostTags () {
    try {
      this.setState({ isFetching: true })
      const data = await this.gettingPostTags.promise
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
      } else {
        this.props.setPostTags(data)
      }
    } catch (error) {
      this.props.setLastError(error)
    } finally {
      this.setState({ isFetching: false })
    }
  }

  getPostTagId (handle) {
    for (let i = 0; i < this.props.postTags.length; i++) {
      if (this.props.postTags[i].handle === 'featured') {
        return this.props.postTags[i].id
      }
    }
  }

  async getPostsByTag (handle) {
    const response = await fetch(`${config.PEONY_STOREFRONT_API}/posts?filter_tags=${handle}`, {
      method: 'GET'
    })
    const data = await response.json()
    return data
  }

  async resolveGettingPostsByTag (handle) {
    try {
      this.setState({ isFetching: true })
      const data = await this.gettingPostsByTag.promise
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
      } else {
        // TODO set by handle
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

        <div className='posts'>
          <Featured featured={this.props.featured} />
          <Posts postsData={this.props.posts} />
          <Tags tags={this.props.postTags} />
        </div>
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

function Featured ({ featured }) {
  return (
    <div>
      <h3>Featured</h3>
      {/* TODO make component */}
      <div>
        {JSON.stringify(featured)}
      </div>
    </div>
  )
}

function sidebarEntry (post) {
  return ('p')
}

function Tags ({ tags }) {
  return (
    <div>
      <h3>Tag</h3>
      <div>
        {JSON.stringify(tags)}
      </div>
    </div>
  )
}
