# Vendored dependency

`js-yaml.cjs` is the unmodified `dist/js-yaml.min.js` from js-yaml 4.3.2,
renamed for CommonJS loading. Its MIT license is in `js-yaml.LICENSE`.
It is bundled because an installed plugin is copied on its own, without the
repository's `node_modules`. Every engineer script imports this copy. Update the distribution and license together when upgrading.
