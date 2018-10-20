const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const toPascalCase = require('to-pascal-case');
const getModelJSTemplate = require('./server/model-templates/model-js-template');
const getModelJsonTemplate = require('./server/model-templates/model-json-template');

const modelName = process.argv[2];
const dashedModelName = _.kebabCase(modelName);
const camelModelName = _.camelCase(modelName);
const pascalModelName = toPascalCase(modelName);
const modelJsTemplate = getModelJSTemplate(pascalModelName, camelModelName);
const modelJsonTemplate = getModelJsonTemplate(pascalModelName, camelModelName);

addModelToConfig();

let pathToGenerate = path.join(__dirname, 'app', 'resources', dashedModelName);

fs.mkdirSync(pathToGenerate);

createFile(pathToGenerate, `${dashedModelName}.js`, modelJsTemplate);
createFile(pathToGenerate, `${dashedModelName}.json`, modelJsonTemplate);

function createFile (filePath, fileName, template) {
  const file = path.join(filePath, fileName);
  fs.writeFileSync(file, template);
  return file;
}

function addModelToConfig () {
  const modelConfigPath = path.join(__dirname, 'server', 'model-config.json');
  const modelConfigData = fs.readFileSync(modelConfigPath, 'utf-8');
  const modelConfigParsedData = JSON.parse(modelConfigData);
  modelConfigParsedData._meta.sources.push(`../app/resources/${dashedModelName}`);
  modelConfigParsedData[pascalModelName] = {
    dataSource: 'mongodb',
    public: true,
  };
  const editedModelConfigData = JSON.stringify(modelConfigParsedData, null, 2);
  fs.writeFileSync(modelConfigPath, editedModelConfigData, 'utf-8');
}
