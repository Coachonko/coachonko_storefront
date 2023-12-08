# Coachonko_storefront

Coachonko's blog frontend

## Notes

- Uses SSR: the JWT is put in a cookie to allow successful first requests to protected routes.
- An XML sitemap is generated in `/dist/static/sitemap.xml` whenever the route `/api/sitemap` is requested.