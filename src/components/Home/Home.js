import { Component } from 'inferno'
import { Link } from 'inferno-router'

export default class Home extends Component {
  constructor (props) {
    super(props)

    this.state = {
      temp: null
    }
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
  if (post.tags) {
    const primaryTag = post.tags[0]
    tag = <Link to={`/tag/${primaryTag.id}`}>{primaryTag.title}</Link>
  }

  const updatedAt = new Date(post.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })

  return (
    <li key={key}>
      <Link to={`/post/${post.id}`}>
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
