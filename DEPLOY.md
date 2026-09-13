# Publishing odonnellwormlab.com

How a change gets from this repo to the live site, and how the lab's other sites relate.
Account details (registrar, DNS, Cloudflare login) are in `INFRASTRUCTURE.md`, which is
gitignored and lives only on the PI's machine.

## The one thing to know

**Pushing `main` does not change the live site.** Cloudflare Pages builds this repo with
`deploy` as its production branch. `main` builds as a *preview* only.

```
git push origin main            # preview build; live site unchanged
git push origin main:deploy     # publish: fast-forwards deploy to main, live in ~1 min
```

Every push to `main` gets its own preview URL, `https://<hash>.odonnell-lab-website.pages.dev`,
listed under Deployments in the Cloudflare dashboard. Check the change there, then publish.

Publishing is fast-forward only. If `main:deploy` is refused as non-fast-forward, someone
committed directly to `deploy`; do not force. Merge `deploy` into `main` and publish again.

## Checking what is live

Cloudflare dashboard → Workers & Pages → `odonnell-lab-website`. The **Production** row shows
the commit hash the live site is built from. If it lags `main`, publish; if it shows an
older hash than you expect, that is the answer to "why isn't my change showing up."

Or locally:

```
git fetch origin
git log --oneline origin/deploy..origin/main    # commits waiting to be published
```

## Hosting

| | |
|---|---|
| Host | Cloudflare Pages, project `odonnell-lab-website` |
| Live | odonnellwormlab.com, also odonnell-lab-website.pages.dev |
| Build | none; `publish = "."`, every file in the repo is served |
| Headers | `_headers` (Cloudflare Pages format). There is deliberately no `netlify.toml`; one was left over from the site's first day on Netlify, 2026-06-04, and removed 2026-09-13 because it implied the wrong host |
| Pre-commit | `.githooks/pre-commit` blocks files over 50 MB, warns over 10 MB |

`data/*.json` is served with CORS open so the worm-mind game can read it cross-origin.

## The lab's other sites, and the rule

| Site | Repo | Host | Publish by |
|---|---|---|---|
| odonnellwormlab.com | `odonnell-lab-website` | Cloudflare Pages | `git push origin main:deploy` |
| Lab wiki, odonnell-lab-wiki.netlify.app | `Lab_tool_wiki` | **Netlify** | `git push` (deploys `main` directly) |
| Worm-mind game, worm-mind-game.pages.dev | `worm-mind-game` | Cloudflare Pages | to move onto this site |
| EHS registrations (private) | `EHS` | not deployed | read live by the wiki's function |

**Static content → Cloudflare Pages. Anything with a server function and secrets → Netlify.**

The wiki is on Netlify because its backend, `netlify/functions/github.js`, holds a GitHub
token and passwords and only runs on Netlify. **The Lab Wiki links on every page of this site
must point at `https://odonnell-lab-wiki.netlify.app`.** From 2026-06-05 to 2026-09-13 they
pointed at a Cloudflare Pages copy of the wiki where the function never ran, so the index
registry and the gated bacteria page were dead for anyone following the link. That copy is
deleted. Do not mirror the wiki to a second host.

## History worth not relearning

- 2026-06-04: site built, briefly on Netlify. 2026-06-05: moved to Cloudflare Pages with
  `deploy` as production branch; DNS to Cloudflare 2026-06-11.
- 2026-09-13: a link fix pushed to `main` built as a preview and the live site kept the old
  build for 21 minutes until `deploy` was pushed. That is how this file came to exist.
