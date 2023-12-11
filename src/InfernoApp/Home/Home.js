import { Component } from 'inferno'
import { Link } from 'inferno-router'

import { config } from '../../../config'
import { isPeonyError } from '../../utils/peony'
import { getPostsByTag, resolveGettingPostsByTag } from '../../utils/data'
import { makeCancelable } from '../../utils/promises'

export default class Home extends Component {
  static initialData = {
    metadata: {
      title: "Coachonko's blog",
      description: 'Exercise physiologist and web developer'
      // ogTitle: '',
      // ogDescription: '',
      // twitterTitle: '',
      // twitterDescription: '',
    }
  }

  static sidebarTags = ['training', 'nutrition']

  constructor (props) {
    super(props)

    this.state = {
      isFetching: false
    }
  }

  async componentDidMount () {
    if (this.props.latestPosts === null) {
      this.gettingLatestPosts = makeCancelable(this.getLatestPosts())
      await this.resolveGettingLatestPosts()
    }

    if (this.props.postTags === null) {
      await this.props.fetchPostTags()
    }

    if (this.props.postsByTag === null) {
      // Get all needed posts
      const tagsToFetch = [...Home.sidebarTags, 'featured']
      for (let i = 0; i < tagsToFetch.length; i++) {
        const tagId = this.getPostTagId(tagsToFetch[i]) // TODO if tagId not exists, set error
        this.gettingPostsByTag = makeCancelable(getPostsByTag(tagId, 'limit=3'))
        await resolveGettingPostsByTag(this, tagsToFetch[i])
      }
    } else {
      // Get only missing posts
      const tagsNeeded = [...Home.sidebarTags, 'featured']
      const tagsToFetch = []
      for (let i = 0; i < tagsNeeded.length; i++) {
        if (!this.props.postsByTag[tagsNeeded[i]]) {
          tagsToFetch.push(tagsNeeded[i])
        }
      }
      for (let i = 0; i < tagsToFetch.length; i++) {
        const tagId = this.getPostTagId(tagsToFetch[i]) // TODO if tagId not exists, set error
        this.gettingPostsByTag = makeCancelable(getPostsByTag(tagId, 'limit=3'))
        await resolveGettingPostsByTag(this, tagsToFetch[i])
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
    if (this.gettingPostsByTag) {
      this.gettingPostsByTag.cancel()
    }
  }

  async getLatestPosts () {
    const response = await fetch(`${config.PEONY_STOREFRONT_API}/posts?limit=10`, {
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

  getPostTagId (handle) {
    for (let i = 0; i < this.props.postTags.length; i++) {
      if (this.props.postTags[i].handle === handle) {
        return this.props.postTags[i].id
      }
    }
  }

  render () {
    let featuredPosts = null
    if (this.props.postsByTag && this.props.postsByTag.featured) {
      featuredPosts = { featured: this.props.postsByTag.featured }
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
        <Header />

        <div className='posts'>
          <Sidebar postTags={this.props.postTags} postsByTag={featuredPosts} />
          <Posts postsData={this.props.latestPosts} />
          <Sidebar postTags={this.props.postTags} postsByTag={otherPostsByTags} />
        </div>
      </>
    )
  }
}

function Header () {
  return (
    <header>
      <h1 className='title'>Coachonko's blog</h1>
      <span className='subtitle'>I may post unique or redundant, high or low quality information, at any given moment</span>
      <p className='content'>hmms</p>
    </header>
  )
}

// TODO move to shared, use in PostTag
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
    tag = <Link to={`${config.BASE_URL}/post_tag/${primaryTag.handle}`}>{primaryTag.title}</Link>
  }

  const updatedAt = new Date(post.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })

  return (
    <li key={key}>
      <Link to={`${config.BASE_URL}/post/${post.handle}`}>
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
function Sidebar ({ postTags, postsByTag }) {
  if (postsByTag === null || postTags === null) {
    return null
  }

  const tagGroups = []
  for (const tagName of Object.keys(postsByTag)) {
    if (postsByTag[tagName]) {
      const postGroup = []
      // Immediately process next tag if no posts are available for the current tag.
      if (postsByTag[tagName].length === 0) {
        continue
      }
      // Only display the latest 3 posts from each tag, or however many are available.
      let maxPosts = 3
      if (postsByTag[tagName].length < 3) {
        maxPosts = postsByTag[tagName].length
      }
      for (let i = 0; i < maxPosts; i++) {
        const post = postsByTag[tagName][i]
        postGroup.push(
          <div>
            <Link to={`${config.BASE_URL}/post/${post.handle}`}>
              <h4>{post.title}</h4>
              <p>{post.excerpt}</p>
              {/* TODO decide how to display each link */}
            </Link>
          </div>
        )
      }

      let currentTag
      for (const tag of postTags) {
        if (tag.handle === tagName) {
          currentTag = tag
        }
      }
      tagGroups.push(
        <div>
          <Link to={`${config.BASE_URL}/post_tag/${currentTag.handle}`}>
            <h3>{tagName}</h3>
          </Link>
          {postGroup}
        </div>
      )
    }
  }

  return tagGroups
}
