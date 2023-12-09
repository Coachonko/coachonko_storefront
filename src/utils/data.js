import { isPeonyError } from './peony'

export async function resolveGettingPostsByTag (instance, handle) {
  try {
    instance.setState({ isFetching: true })
    const data = await instance.gettingPostsByTag.promise
    if (isPeonyError(data)) {
      instance.props.setPeonyError(data)
    } else {
      const newPostsByTag = { ...instance.props.postsByTag, [handle]: data }
      instance.props.setPostsByTag(newPostsByTag)
    }
  } catch (error) {
    instance.props.setLastError(error)
  } finally {
    instance.setState({ isFetching: false })
  }
}
