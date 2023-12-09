import { Component } from 'inferno'
import { Redirect } from 'inferno-router'

import { config } from '../../../config'
import { isPeonyError } from '../../utils/peony'
import { makeCancelable } from '../../utils/promises'

export default class Page extends Component {
  static async getInitialData (url) {
    const handle = url.split('/').pop()
    return fetch(`${config.PEONY_STOREFRONT_API}/pages/handle/${handle}`)
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
      pageData: initialData
    }
  }

  async componentDidMount () {
    // Check SSR data set by constructor
    if (this.state.pageData === null) {
      // Check InfernoApp state
      if (this.props.pages && this.props.pages[this.props.match.params.handle]) {
        this.setState({ pageData: this.props.pages[this.props.match.params.handle] })
      } else {
        this.gettingPageData = makeCancelable(Page.getInitialData(this.props.match.params.handle))
        await this.resolveGettingPageData()
      }
    } else {
      if (this.props.pages === null || !this.props.pages[this.state.pageData.handle]) {
        let newPages = {}
        newPages = {
          ...this.props.pages,
          [this.state.pageData.handle]: this.state.pageData
        }
        this.props.setPages(newPages)
      }
    }
  }

  componentWillUnmount () {
    if (this.gettingPageData) {
      this.gettingPageData.cancel()
    }
  }

  async resolveGettingPageData () {
    try {
      this.setState({ isFetching: true })
      const response = await this.gettingPageData.promise
      const data = await response.json()
      if (isPeonyError(data)) {
        this.props.setPeonyError(data)
        this.setState({ pageData: data })
      } else {
        let newPages = {}
        newPages = {
          ...this.props.pages,
          [data.handle]: data
        }
        this.props.setPages(newPages)
        this.setState({ pageData: data })
      }
    } catch (error) {
      this.props.setLastError(error)
    } finally {
      this.setState({ isFetching: false })
    }
  }

  render () {
    console.log(this.state.pageData)
    if (isPeonyError(this.state.pageData)) {
      if (this.state.pageData.code === 404) {
        return <Redirect to='/404' />
      }
    }

    return (
      <>
        <Main pageData={this.state.pageData} />
      </>
    )
  }
}

function Main ({ pageData }) {
  if (pageData === null) {
    return null
  }

  return (
    <main>
      <h1>{pageData.title}</h1>
      <span>{pageData.subtitle}</span>
      <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
    </main>
  )
}
