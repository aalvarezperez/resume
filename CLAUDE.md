# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Jekyll-based personal resume site deployed to GitHub Pages at `https://aalvarezperez.github.io/resume`. All resume content is data-driven via `_data/resume.yml`.

## Commands

| Task | Command |
|------|---------|
| Install dependencies | `script/bootstrap` or `bundle install` |
| Serve locally | `rake serve` |
| Build for production | `bundle exec jekyll build` |
| Lint SCSS | `bundle exec scss-lint --config=.scss-lint.yml` |
| Full CI check | `script/cibuild` |

Ruby 3.4.5 required (see `script/.ruby-version`).

## Architecture

**Content/data separation**: Resume data lives entirely in `_data/resume.yml`. Templates in `_layouts/resume.html` render it via Liquid. Edit content in the YAML file, not the templates.

**Template chain**: `_layouts/default.html` (base shell with head/foot includes) wraps `_layouts/resume.html` (resume-specific rendering from YAML data).

**Timeline layout**: Experience and Education sections use a LinkedIn-style timeline. Entries with the same `group` key in the YAML are visually connected: first entry shows a logo, subsequent entries show a dot, and a vertical line links them. The logic uses `connected_down` (has next sibling in group) and `continued` (has previous sibling in group) flags computed in Liquid.

**Liquid gotcha**: `array[-1]` in Liquid wraps to the last element. The `continued` check must include `forloop.first == false` to prevent the first entry from matching the last entry's group.

**Timeline CSS** (`_sass/_body.scss`): Lines are drawn with two pseudo-elements per entry. `::after` draws downward from below the marker to the entry bottom (hidden on `--last` entries). `::before` on `--continued` entries draws a short segment from the entry top down toward the dot. The dot and logo use `z-index: 2` to sit above the lines. Line axis is `left: calc(1.1rem - 1px)` to center the 2px line on the 2.2rem marker column.

**Service worker**: `sw.js` provides offline caching. Version is derived from `site.time` in Jekyll. `update-notification.js` shows a Bootstrap toast when a new version is detected. Config is passed via a `SW_CONFIG` global set in `_includes/head.html`.

**Styling**: SCSS partials in `_sass/` (`_body`, `_footer`, `_header`, `_main`). Bootstrap 5.3.0 loaded via CDN. Linted with `scss-lint`.

**Deployment**: Pushes to `master` trigger GitHub Actions (`.github/workflows/pages.yml`) which build and deploy to GitHub Pages. PRs run a build check via `ci.yml`.

## Git

Do NOT add a `Co-Authored-By` line to commits in this project.

## Key Files

- `_data/resume.yml` — all resume content
- `_config.yml` — Jekyll config, baseurl `/resume`, service worker settings
- `_layouts/resume.html` — main template rendering resume data
- `_includes/head.html` — SW_CONFIG injection, CDN links
- `sw.js` — service worker (must be at site root for correct scope)
- `assets/js/update-notification.js` — new-version toast logic
