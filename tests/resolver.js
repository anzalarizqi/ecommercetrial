/**
 * Custom Jest resolver to force React and react-router to resolve
 * from tests/node_modules, avoiding dual-copy issues when importing
 * frontend components from the tests directory.
 */
const FORCE_FROM_TESTS = [
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
  'scheduler',
];

module.exports = (request, options) => {
  const pkg = request.split('/')[0];
  if (FORCE_FROM_TESTS.includes(pkg)) {
    return options.defaultResolver(request, {
      ...options,
      basedir: options.rootDir,
    });
  }
  return options.defaultResolver(request, options);
};
