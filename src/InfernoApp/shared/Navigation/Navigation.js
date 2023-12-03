import Footer from './Footer'
import Nav from './Nav'

export default function Navigation ({ children }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  )
}
