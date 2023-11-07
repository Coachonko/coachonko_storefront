import { Link } from 'inferno-router'

export default function Footer () {
  const copyrightYear = new Date().getFullYear()
  return (
    <footer>
      <div className='left'>

        <span>Thanks for reading.</span>
        <br />

        <Link to='/contact'>contact</Link>
        <Link to='/privacy'>privacy</Link>
        <br />
        <Link to='https://github.com/Coachonko'>Github</Link>
        <Link to='https://www.twitch.tv/coachonko'>Twitch</Link>
      </div>

      <div className='right'>
        {/* TODO newsletter */}
        <Link to='https://coachonko.com'>© Coachonko {copyrightYear}</Link>
      </div>
    </footer>
  )
}
