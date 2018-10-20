module.exports = (pascalModelName, camelModelName) => {
  return `{
  "name": "${pascalModelName}",
  "plural": "${camelModelName}s",
  "base": "PersistedModel",
  "idInjection": true,
  "options": {
    "validateUpsert": true
  },
  "properties": {},
  "validations": [],
  "relations": {},
  "acls": [],
  "methods": {}
}
`;
};
