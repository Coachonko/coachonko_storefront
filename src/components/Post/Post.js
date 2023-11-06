export default function Post (props) {
  if (props.posts) {
    const post = props.posts.find(obj => obj.id === props.match.params.id)
    return <div dangerouslySetInnerHTML={{ __html: post.content }} />
  }
}
