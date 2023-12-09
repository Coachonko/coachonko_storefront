import { config } from '../../config'

// isPeonyError returns true if the response is a PeonyError object.
export function isPeonyError (response) {
  const expectedProperties = ['message', 'code', 'data', 'timestamp']

  if (
    response &&
    typeof response === 'object' &&
    expectedProperties.every(prop => prop in response) &&
    Object.keys(response).length === expectedProperties.length
  ) {
    return true
  }
  return false
}

/*
*
*
* Storefront data fetching functions
*
*
*/
export async function getPostsByTag (id, params) {
  const response = await fetch(`${config.PEONY_STOREFRONT_API}/posts?filter_tags=${id}&${params}`, {
    method: 'GET'
  })
  const data = await response.json()
  return data
}
