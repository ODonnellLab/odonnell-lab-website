# odonnellwormlab.com — O'Donnell Lab website

Static site on Cloudflare Pages. No build step; every file in the repo is served.

**Publishing:** read `DEPLOY.md` before touching deployment. The production branch is
`deploy`, not `main`. `git push origin main` only makes a preview; `git push origin main:deploy`
publishes. Do not publish without being asked.

**Lab Wiki links** on every page point at `https://odonnell-lab-wiki.netlify.app`. Never
change them to a `pages.dev` address; `DEPLOY.md` explains why.

`INFRASTRUCTURE.md` is gitignored and holds account details; it exists only on the PI's
machine. `.githooks/pre-commit` blocks large media files.
