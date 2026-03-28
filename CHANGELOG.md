# Changelog

## [0.0.2](https://github.com/Maestrotwors/iorder-market-app/compare/v0.0.1...v0.0.2) (2026-03-28)


### Features

* add ArgoCD manual deploy per service ([#24](https://github.com/Maestrotwors/iorder-market-app/issues/24)) ([550df46](https://github.com/Maestrotwors/iorder-market-app/commit/550df460eccd6d5fc6497fe6dbb3849986d15fe6))
* add argocd setup and watch scripts with auto-restart ([d2044e0](https://github.com/Maestrotwors/iorder-market-app/commit/d2044e083da10f69470ef465b1d32b1c1435fedd))
* argocd setup and watch scripts ([c2c3f3f](https://github.com/Maestrotwors/iorder-market-app/commit/c2c3f3f9647cbb8acebbc8d4b9ff1376d80ec276))
* **ci:** parallel jobs with caching ([d92d078](https://github.com/Maestrotwors/iorder-market-app/commit/d92d0780584cccded0b56b3f7676c01efa190cf8))
* **ci:** parallel jobs, caching, frontend+backend builds, security audit ([ddbf707](https://github.com/Maestrotwors/iorder-market-app/commit/ddbf707d5c22f71be98b0be3ffc6b4672914d325))
* **observability:** add Loki logging + Tempo tracing with OpenTelemetry ([6195721](https://github.com/Maestrotwors/iorder-market-app/commit/61957217a398cb2fcb866829b043ae2dbc4bd745))
* **observability:** Loki + Tempo + OpenTelemetry stack ([63d2a87](https://github.com/Maestrotwors/iorder-market-app/commit/63d2a87c1509852ea4f1507c8a60e9079e101ea0))
* Playwright E2E + Vitest API tests + Docker dev stack ([#9](https://github.com/Maestrotwors/iorder-market-app/issues/9)) ([33aa071](https://github.com/Maestrotwors/iorder-market-app/commit/33aa071bd14f62344aefeb3c2a7318b0ea7278fb))
* RedPanda consumer, per-service ArgoCD, Helm improvements ([#22](https://github.com/Maestrotwors/iorder-market-app/issues/22)) ([4ef98b7](https://github.com/Maestrotwors/iorder-market-app/commit/4ef98b73aa7bfc4c99101afa619aeafe84ebeb85))
* vitest integration, zero-downtime k8s, LoadBalancer, resource optimization ([27d89de](https://github.com/Maestrotwors/iorder-market-app/commit/27d89de46796ba9729b38d012c81c89373cea3c3))
* WAL/CDC pipeline — Debezium + RedPanda Console ([#16](https://github.com/Maestrotwors/iorder-market-app/issues/16)) ([8568b71](https://github.com/Maestrotwors/iorder-market-app/commit/8568b71200e7c50a630f6547a04f5bcb2071970a))
* WAL/CDC pipeline with RedPanda and application-level events ([#18](https://github.com/Maestrotwors/iorder-market-app/issues/18)) ([7f8f7ce](https://github.com/Maestrotwors/iorder-market-app/commit/7f8f7cee416167976ef783ba4345f2e99d1205dc))
* WAL/CDC pipeline, barrelLess imports, RedPanda improvements ([#19](https://github.com/Maestrotwors/iorder-market-app/issues/19)) ([cf8cc69](https://github.com/Maestrotwors/iorder-market-app/commit/cf8cc699d535487a8dcf1ffc7977ceb52643353a))


### Bug Fixes

* **ci:** add binary bun.lockb (bun 1.1 format) ([bf505d3](https://github.com/Maestrotwors/iorder-market-app/commit/bf505d37416644e1fd2259e9f497e154beb74515))
* **ci:** add Docker image prune to argocd-watch after deploy ([#15](https://github.com/Maestrotwors/iorder-market-app/issues/15)) ([388f2a2](https://github.com/Maestrotwors/iorder-market-app/commit/388f2a2d4411491a04b7c05dc1c29b3bcb89d717))
* **ci:** add summary ci job for branch protection check ([68b45c2](https://github.com/Maestrotwors/iorder-market-app/commit/68b45c22111acd8e62eb3aa515c0d63081b2d77f))
* **ci:** add tsconfig.json for shared-contracts package (sheriff needs it) ([9dca7d0](https://github.com/Maestrotwors/iorder-market-app/commit/9dca7d0d788582a9217afab63c8c812558b43ed0))
* **ci:** exclude packages/microservices/infrastructure from eslint sheriff ([24616f0](https://github.com/Maestrotwors/iorder-market-app/commit/24616f0bee2ede767b0aa5c4a05c24dc8cf13408))
* **ci:** format code, sync all pending changes ([aa70d85](https://github.com/Maestrotwors/iorder-market-app/commit/aa70d856568ef5b78376624b4f16102cc9c43c5c))
* **ci:** pin bun 1.2, add postgres service, generate prisma client ([6e62b22](https://github.com/Maestrotwors/iorder-market-app/commit/6e62b22125b33a98fa621597d5083f6832e5353c))
* **ci:** pin bun-types version, update lockfile ([ddfffea](https://github.com/Maestrotwors/iorder-market-app/commit/ddfffeaddc391f6515da4d3fb470fa654fe67ae7))
* **ci:** regenerate bun.lock for bun 1.2 compatibility ([489221d](https://github.com/Maestrotwors/iorder-market-app/commit/489221d4b8f614e6c03dd1e31fc796be4e06bae7))
* **ci:** resolve all sheriff lint errors, add barrel files, exclude scripts ([9e243e4](https://github.com/Maestrotwors/iorder-market-app/commit/9e243e441dea534e0d6cc65d7d95b8ab7b8f5432))
* **ci:** restore shared-contracts package.json, add packages to workspaces, fix bun version ([0864e0d](https://github.com/Maestrotwors/iorder-market-app/commit/0864e0d59d325aaf920f4c3cbb33e09352518fda))
* **ci:** restore workspace packages, pin bun 1.1.45, fix lockfile ([63bf66e](https://github.com/Maestrotwors/iorder-market-app/commit/63bf66e96dcf87a9f672ec5903143134a571ab07))
* **ci:** skip husky install in CI where binary is unavailable ([418f602](https://github.com/Maestrotwors/iorder-market-app/commit/418f602b9cd0657933d519103281c947249500a9))
* **ci:** upgrade actions to v5 (Node.js 24) to remove deprecation warning ([15a5542](https://github.com/Maestrotwors/iorder-market-app/commit/15a554251f26c3103024ba8e33806f934a845949))
* **ci:** use bun 1.1.45 to match local version and lockfile format ([3754c89](https://github.com/Maestrotwors/iorder-market-app/commit/3754c8966727342bad51edc004e37f5d1ce02dad))
* **ci:** use sed instead of grep -P for macOS compatibility ([#14](https://github.com/Maestrotwors/iorder-market-app/issues/14)) ([7d745ee](https://github.com/Maestrotwors/iorder-market-app/commit/7d745ee07f42535452971cca9dc96f9a0a41ba34))
* **k8s:** prevent duplicate helm releases and fix frontend nginx config ([4db752b](https://github.com/Maestrotwors/iorder-market-app/commit/4db752b0781de3e24f168dba5f1300cbea1b513b))
* **k8s:** prevent duplicate releases and stabilize cluster ([e3a6bc5](https://github.com/Maestrotwors/iorder-market-app/commit/e3a6bc5e193507e4b77afa4bce9a28fab040d05c))
* prettier formatting for shared-observability ([318e31d](https://github.com/Maestrotwors/iorder-market-app/commit/318e31d99e4bea6ff457675f53d14212a0a7a2ae))
* replace ArgoCD ApplicationSet with single Application ([#26](https://github.com/Maestrotwors/iorder-market-app/issues/26)) ([04b9822](https://github.com/Maestrotwors/iorder-market-app/commit/04b9822fecca9a9ca8b4214ba45024e3d17faa0c))
* resolve all lint errors for CI — barrel imports, sheriff config, unused vars ([85b41d9](https://github.com/Maestrotwors/iorder-market-app/commit/85b41d958612d7dd82a45fba1596e0c3b27a5089))
* restore per-service ArgoCD apps with correct naming ([#28](https://github.com/Maestrotwors/iorder-market-app/issues/28)) ([cb91eb4](https://github.com/Maestrotwors/iorder-market-app/commit/cb91eb478d73173f2debb4bf1f4cfd4306502bd6))
* **scripts:** robust auto-recovery + test ArgoCD deploy ([e21ee69](https://github.com/Maestrotwors/iorder-market-app/commit/e21ee692f87fc4cdf56e26c52d82a658b21612f4))
* **scripts:** robust startup with auto-recovery for minikube, tunnel, and pods ([8411059](https://github.com/Maestrotwors/iorder-market-app/commit/84110593a77fe46bea56e8e9caaa5fb4f14a193d))
* update version to 350 ([#25](https://github.com/Maestrotwors/iorder-market-app/issues/25)) ([bbafe52](https://github.com/Maestrotwors/iorder-market-app/commit/bbafe5200239b0288b42db4b744939c205879f53))
* update version to 350 ([#27](https://github.com/Maestrotwors/iorder-market-app/issues/27)) ([f92825a](https://github.com/Maestrotwors/iorder-market-app/commit/f92825a4333eb2d8620f1b6911e92f0ebf163cd5))
