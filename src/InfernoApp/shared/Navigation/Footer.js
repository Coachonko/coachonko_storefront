import { Link } from 'inferno-router'

import { config } from '../../../../config'

export default function Footer () {
  const copyrightYear = new Date().getFullYear()
  return (
    <footer>
      <div className='left'>

        <span>Thanks for reading.</span>
        <br />

        <Link to={`${config.BASE_URL}/contact`}>contact</Link>
        <Link to={`${config.BASE_URL}/page/privacy`}>privacy</Link>
        <br />
        <Link to='https://github.com/Coachonko'>Github</Link>
        <Link to='https://www.twitch.tv/coachonko'>Twitch</Link>
      </div>

      <div className='right'>
        {/* TODO newsletter */}
        <Link to={config.BASE_URL}>© Coachonko {copyrightYear}</Link>
      </div>
    </footer>
  )
}
