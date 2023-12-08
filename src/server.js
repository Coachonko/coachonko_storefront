import { resolve } from 'node:path'
import { createWriteStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { App as TinyhttpApp } from '@tinyhttp/app'
import { renderToString } from 'inferno-server'
import { StaticRouter, matchPath } from 'inferno-router'

import { config } from '../config'
import { routes, InfernoApp } from './InfernoApp'

const app = new TinyhttpApp()

// peony sends the browser a JWT, but a JWT cannot be provided by the browser on its first request.
// The solution is to let the frontend server put the JWT in a cookie and give the cookie to the browser.
app.get('/api/auth', (req, res) => {
  res.send('use this route for setting cookies')
})

app.get('/api/sitemap', async (req, res) => {
  try {
    await generateSitemap()
    res.sendStatus(200)
  } catch (err) {
    // TODO handle errors
    res.sendStatus(500)
  }
})

// Serve static files during development.
// Note: in production, configure lighttpd to serve static files instead.
app.get('/static/*', async (req, res) => {
  return await fileResponse(req.path, res)
})

// Redirect requests for static files in dist/ to dist/static/
// Note: in production, configure lighttpd to serve these static files too.
async function handleStaticFile (req, res) {
  const adjustedPath = `/static${req.path}`
  return await fileResponse(adjustedPath, res)
}
app.get('/favicon.ico', handleStaticFile)
app.get('/sitemap.xml', handleStaticFile)

// Every other route can be handled by inferno-router
app.get('/*', async (req, res) => {
  return await infernoServerResponse(req, res)
})

app.listen(config.PORT)

async function fileResponse (path, res) {
  const filePath = resolve(`dist${path}`)

  try {
    const stats = await stat(filePath)

    if (!stats.isFile()) {
      res.sendStatus(404)
    } else {
      res.sendFile(filePath)
    }
  } catch (err) {
    // TODO handle errors correctly
    res.sendStatus(404)
  }
}

// generateSitemap
//
async function generateSitemap (req, res) {
  try {
    const stream = createWriteStream('dist/static/sitemap.xml')
    stream.write(`<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`)

    // handle pages
    // <loc> is not used because changes may happen on either API or this application.
    for (const route of routes) {
      if (route.sitemap === true) {
        stream.write(`
          <url>
            <loc>${config.BASE_URL}${route.path}</loc>
          </url>`)
      }
    }
    // handle posts
    const postsResponse = await fetch(`${config.PEONY_STOREFRONT_API}/posts`)
    const postsData = await postsResponse.json()
    for (const post of postsData) {
      stream.write(`
      <url>
        <loc>${config.BASE_URL}/post/${post.handle}</loc>
        <lastmod>${post.updatedAt}</lastmod>
      </url>`)
    }

    // handle postTags
    const postTagsResponse = await fetch(`${config.PEONY_STOREFRONT_API}/post_tags`)
    const postTagsData = await postTagsResponse.json()
    for (const postTag of postTagsData) {
      stream.write(`
      <url>
        <loc>${config.BASE_URL}/post/${postTag.handle}</loc>
        <lastmod>${postTag.updatedAt}</lastmod>
      </url>`)
    }

    stream.write('</urlset>')
  } catch (err) {
    // TODO handle errors
    console.error(err)
  }
}

// infernoServerResponse
//
async function infernoServerResponse (req, res) {
  try {
    let currentRoute = routes.find((route) => matchPath(req.url, route))
    if (!currentRoute) {
      currentRoute = {}
    }

    let initialData = {}
    if (currentRoute.getInitialData) {
      const response = await currentRoute.getInitialData(req.url)
      if (!response.ok) {
        const err = await response.text()
        throw new Error(err)
      }
      initialData = await response.json()
    }

    const context = { initialData }
    const renderedApp = renderToString(
      <StaticRouter
        context={context}
        location={req.url}
      >
        <InfernoApp />
      </StaticRouter>
    )

    if (context.url) {
      return res.redirect(context.url)
    }

    // Standard SEO
    let title = "Coachonko's blog"
    let metaDescription = 'Exercise physiologist and web developer'
    const metaLanguage = 'en-US'
    let metaDate = ''
    let metaRobots = ''
    let metaAuthor = ''
    const relCanonical = config.BASE_URL + req.url

    if (req.url === '') { // TODO only add on private routes
      metaRobots = '<meta name="robots" content="noindex, nofollow">'
    }

    if (req.url === '') { // TODO only add on posts
      metaAuthor = '<meta name="author" content="Jane Smith" />'
    }

    if (initialData) {
      metaDate = initialData.updatedAt

      if (initialData.metadata) {
        if (initialData.metadata.title) {
          title = initialData.metadata.title
        }
        if (initialData.metadata.description) {
          metaDescription = initialData.metadata.description
        }
      }
    }

    // OpenGraph https://ogp.me/
    const ogSiteName = "Coachonko's blog"
    let ogTitle = title
    let ogDescription = metaDescription
    const ogRest = '' // TODO route-based

    if (initialData.metadata) {
      if (initialData.metadata.ogTitle) {
        ogTitle = initialData.metadata.ogTitle
      }
      if (initialData.metadata.ogDescription) {
        ogDescription = initialData.metadata.ogDescription
      }
      // author
      // TODO <meta property="og:image" content="${}" />
      // og:video
    }

    // if (req.url === '') {
    //   ogRest = `
    //   <meta property="og:type" content="video.movie" />
    //   <meta property="og:locale:alternate" content="${langs}" />`
    // }

    // Twitter https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/app-card
    const twitterSite = ''
    let twitterTitle = title
    let twitterDescription = metaDescription
    const twitterRest = '' // TODO route based
    if (initialData.metadata) {
      if (initialData.metadata.twitterTitle) {
        twitterTitle = initialData.metadata.twitterTitle
      }
      if (initialData.metadata.twitterDescription) {
        twitterDescription = initialData.metadata.twitterDescription
      }
      // <meta name="twitter:image" content="https://www.example.com/image.jpg">
      // <meta name="twitter:creator" content="${twitterCreator}"> TODO author if in user.metadata.twitterCreator
    }

    return res.send(`
    <!DOCTYPE html>
    <html lang="en">

    <head>
      ${metaRobots}
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <title>${title}</title>
      <meta name="description" content="${metaDescription}" />
      <meta http-equiv="content-language" content="${metaLanguage}" />
      <meta name="date" content="${metaDate}" />
      <link rel="canonical" href="${relCanonical}" />
      ${metaAuthor}

      <meta property="og:site_name" content="${ogSiteName}" />
      <meta property="og:title" content="${ogTitle}" />
      <meta property="og:description" content="${ogDescription}" />
      <meta property="og:url" content="${relCanonical}" />
      <meta property="og:locale" content="${metaLanguage}" />
      ${ogRest}

      <meta name="twitter:card" content="summary">
      <!-- <meta name="twitter:site" content="${twitterSite}"> no twitter handle for website yet -->
      <meta name="twitter:title" content="${twitterTitle}">
      <meta name="twitter:description" content="${twitterDescription}">
      <meta name="twitter:url" content="${relCanonical}">
      ${twitterRest}

      <link rel="stylesheet" type="text/css" href="static/bundle.css" />
      <script src="/static/browser.js" defer></script>
      <script>window.___initialData = ${JSON.stringify(initialData)};</script>
    </head>

    <body>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div id="root">${renderedApp}</div>
    </body>

    </html>
  `)
  } catch (err) {
    // TODO handle errors
    console.error(err)
    res.sendStatus(500)
  }
}
