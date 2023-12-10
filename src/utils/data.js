import { isPeonyError } from './peony'

export async function resolveGettingPostsByTag (instance, handle) {
  try {
    instance.setState({ isFetching: true })
    const data = await instance.gettingPostsByTag.promise
    if (isPeonyError(data)) {
      instance.props.setPeonyError(data)
    } else {
      const prevData = instance.props.postsByTag
      if (prevData === null) {
        // If prevData was initialized null by InfernoApp
        instance.props.setPostsByTag({ [handle]: data })
      } else {
        if (prevData[handle]) {
          // If key exists, merge existing data with new data
          const mergedData = [...prevData[handle], ...data]
          instance.props.setPostsByTag({ ...prevData, [handle]: mergedData })
        } else {
          // If key doesn't exist, create a new entry
          instance.props.setPostsByTag({ ...prevData, [handle]: data })
        }
      }
    }
  } catch (error) {
    instance.props.setLastError(error)
  } finally {
    instance.setState({ isFetching: false })
  }
}
