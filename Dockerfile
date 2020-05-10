FROM renovate/buildpack:2-node as base

LABEL org.opencontainers.image.source="https://github.com/renovatebot/auto-cancel-actions"

# renovate: datasource=docker depName=node versioning=docker
ARG NODE_VERSION=12.16.3
RUN install-tool node

# renovate: datasource=npm depName=yarn versioning=npm
ARG YARN_VERSION=1.22.4
RUN install-tool yarn

FROM base as build

COPY . .

RUN yarn install --frozen-lockfile --link-duplicates
RUN yarn compile

FROM base as final



USER 1000
