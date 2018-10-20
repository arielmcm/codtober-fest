module.exports = (pascalModelName, camelModelName) => {
  return `const Resource = require('../Resource');

module.exports = ${pascalModelName} => {
  const ${camelModelName}Resource = new Resource(${pascalModelName});
};
`;
};
