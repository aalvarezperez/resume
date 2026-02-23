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

**Service worker**: `sw.js` provides offline caching. Version is derived from `site.time` in Jekyll. `update-notification.js` shows a Bootstrap toast when a new version is detected. Config is passed via a `SW_CONFIG` global set in `_includes/head.html`.

**Styling**: SCSS partials in `_sass/` (`_body`, `_footer`, `_header`, `_main`). Bootstrap 5.3.0 loaded via CDN. Linted with `scss-lint`.

**Deployment**: Pushes to `master` trigger GitHub Actions (`.github/workflows/pages.yml`) which build and deploy to GitHub Pages. PRs run a build check via `ci.yml`.

## Key Files

- `_data/resume.yml` — all resume content
- `_config.yml` — Jekyll config, baseurl `/resume`, service worker settings
- `_layouts/resume.html` — main template rendering resume data
- `_includes/head.html` — SW_CONFIG injection, CDN links
- `assets/js/sw.js` — service worker
- `assets/js/update-notification.js` — new-version toast logic
