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

    if (this.props.latestPosts === null) {
      this.gettingLatestPosts = makeCancelable(this.getLatestPosts())
      await this.resolveGettingLatestPosts()
    }

    if (this.props.postsByTag === null) {
      // Get all needed posts
      if (this.props.postTags === null) {
        this.gettingPostTags = makeCancelable(this.getPostTags())
        await this.resolveGettingPostTags()
      }
      const tagsToFetch = [...config.HOME_TAGS, 'featured']
      for (let i = 0; i < tagsToFetch.length; i++) {
        const tagId = this.getPostTagId(tagsToFetch[i]) // TODO if tagId not exists, set error
        this.gettingPostsByTag = makeCancelable(this.getPostsByTag(tagId))
        await this.resolveGettingPostsByTag(tagsToFetch[i])
      }
    } else {
      // Get only missing posts
      if (this.props.postTags === null) {
        this.gettingPostTags = makeCancelable(this.getPostTags())
        await this.resolveGettingPostTags()
      }
      const tagsNeeded = [...config.HOME_TAGS, 'featured']
      const tagsToFetch = []
      for (let i = 0; i < tagsNeeded.length; i++) {
        if (!this.props.postsByTag[tagsNeeded[i]]) {
          tagsToFetch.push(tagsNeeded[i])
        }
      }
      for (let i = 0; i < tagsToFetch.length; i++) {
        const tagId = this.getPostTagId(tagsToFetch[i]) // TODO if tagId not exists, set error
        this.gettingPostsByTag = makeCancelable(this.getPostsByTag(tagId))
        await this.resolveGettingPostsByTag(tagsToFetch[i])
      }
    }
  }

  componentWillUnmount () {
    if (this.gettingPosts) {
      this.gettingLatestPosts.cancel()
    }
    if (this.gettingNextPosts) {
      this.gettingNextPosts.cancel()
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

  async getLatestPosts () {
    const response = await fetch(`${config.PEONY_STOREFRONT_API}/posts`, {
      method: 'GET'
    })
    const data = await response.json()
    return data
  }

  async resolveGettingLatestPosts () {
    try {
      this.setState({ isFetching: true })
      const data = await this.gettingLatestPosts.promise
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
      } else {
        this.props.setLatestPosts(data)
      }
    } catch (error) {
      this.props.setLastError(error)
    } finally {
      this.setState({ isFetching: false })
    }
  }

  async getNextPosts () {
    const offset = this.props.latestPosts.length + 10
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
        const newPostsArray = [...this.props.latestPosts, ...data]
        this.props.setLatestPosts(newPostsArray)
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
      if (this.props.postTags[i].handle === handle) {
        return this.props.postTags[i].id
      }
    }
  }

  async getPostsByTag (handle) {
    // TODO limit number of posts to get (sidebar)
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
        const newPostsByTag = { ...this.props.postsByTag, [handle]: data }
        this.props.setPostsByTag(newPostsByTag)
      }
    } catch (error) {
      this.props.setLastError(error)
    } finally {
      this.setState({ isFetching: false })
    }
  }

  render () {
    let postsByFeatured = null
    if (this.props.postsByTag && this.props.postsByTag.featured) {
      postsByFeatured = { featured: this.props.postsByTag.featured }
    }
    let otherPostsByTags = null
    if (this.props.postsByTag && Object.keys(this.props.postsByTag).length > 0) {
      if (this.props.postsByTag.featured) {
        if (Object.keys(this.props.postsByTag).length > 1) {
          otherPostsByTags = { ...this.props.postsByTag }
          delete otherPostsByTags.featured
        }
      } else {
        otherPostsByTags = { ...this.props.postsByTag }
      }
    }

    return (
      <>
        <Main homeData={this.state.homeData} />

        <div className='posts'>
          <Sidebar postsByTag={postsByFeatured} />
          <Posts postsData={this.props.latestPosts} />
          <Sidebar postsByTag={otherPostsByTags} />
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

// Accepts an object, expects that all of its properties are arrays of posts.
function Sidebar ({ postsByTag }) {
  if (postsByTag === null) {
    return null
  }

  const tagGroups = []
  for (const tagName in postsByTag) {
    // TODO follow order of config.HOME_TAGS
    const GroupPosts = []
    for (const post of postsByTag[tagName]) {
      // TODO add Link
      GroupPosts.push(
        <div>
          <h4>{post.title}</h4>
          <p>{post.excerpt}</p>
          {/* TODO decide how to display */}
        </div>
      )
    }
    tagGroups.push(
      <div>
        <h3>{tagName}</h3>
        {GroupPosts}
      </div>
    )
  }

  // TODO display the 3 latest post excerpt from each tag
  return tagGroups
}
