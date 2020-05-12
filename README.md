[![Build status](https://github.com/renovatebot/auto-cancel-actions/workflows/build/badge.svg)](https://github.com/renovatebot/auto-cancel-actions/actions?query=workflow%3Abuild)

# auto-cancel-actions

Github app to autocancel previous builds of github workflows. This action is automatically deployed to [glitch](https://glitch.com/~renovatebot-auto-cancel-actions).

## Configuration

Config file need to be: `.github/auto-cancel-actions.yml` and `version` mus be `1`.

`branches` are a list of [`micromatch`](https://www.npmjs.com/package/micromatch) expressions.

### Samples

Don't cancel workflows on master branch (default config)

```yml
version: 1
push:
  branches:
    - '!master'
pull_request:
```

Cancel workflows on all branches and pull requests

```yml
version: 1
push:
pull_request:
```

Cancel only workflows on `master` or `renovate/**` branches

```yml
version: 1
push:
  branches:
    - master
    - 'renovate/**'
```

## Deployment

see https://probot.github.io/docs/deployment/#deploy-the-app

## Configuration

see https://probot.github.io/docs/configuration/
