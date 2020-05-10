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

EXPOSE 3000

COPY package.json package.json
COPY --from=build /usr/src/app/dist /usr/src/app/dist

RUN set -ex; \
  echo "#!/bin/bash" > /usr/local/bin/auto-cancel-actions; \
  echo "node /usr/src/app/dist" >> /usr/local/bin/auto-cancel-actions; \
  chmod +x /usr/local/bin/auto-cancel-actions;

CMD ["auto-cancel-actions"]

USER 1000
