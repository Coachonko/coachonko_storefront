import { config } from '../../config'
import { isPeonyError } from './peony'

export function retrieveInitialData (staticContext) {
  let initialData = null
  if (typeof window === 'undefined') {
    initialData = staticContext.initialData
  } else {
    if (window.___initialData) {
      initialData = window.___initialData
      delete window.___initialData
    }
  }
  return initialData
}

// TODO just pass it the tag and handle everything in one function?
// TODO move to InfernoApp instead?
export async function getPostsByTag (id, params) {
  const response = await fetch(`${config.PEONY_STOREFRONT_API}/posts?filter_tags=${id}&${params}`, {
    method: 'GET'
  })
  const data = await response.json()
  return data
}

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
