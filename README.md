[![Build status](https://github.com/renovatebot/auto-cancel-actions/workflows/build/badge.svg)](https://github.com/renovatebot/auto-cancel-actions/actions?query=workflow%3Abuild)

# auto-cancel-actions

Github app to autocancel previous builds of GitHub workflows.
This action is automatically deployed to [Glitch](https://glitch.com/~renovatebot-auto-cancel-actions).

## Configuration

The configuration file is called `auto-cancel-actions.yml` and must be placed in the `.github` directory: `.github/auto-cancel-actions.yml`.
At the top of this file you must specify that the `version` is `1`.

`branches` are a list of [`micromatch`](https://www.npmjs.com/package/micromatch) expressions.

### Example configurations

#### Don't cancel workflows on `main` branch (default config)

```yml
version: 1
push:
  branches:
    - '!main'
pull_request:
```

#### Cancel workflows on all branches and pull requests

```yml
version: 1
push:
pull_request:
```

#### Cancel only workflows on `main` or `renovate/**` branches

```yml
version: 1
push:
  branches:
    - main
    - 'renovate/**'
```

## Deployment

For more information about deploying the bot, read the [probot docs on deployment](https://probot.github.io/docs/deployment/#deploy-the-app).

## Configuration

For more information about configuring the bot, read the [probot docs on configuration](https://probot.github.io/docs/configuration/).
