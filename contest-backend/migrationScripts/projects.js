const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
let pagePosition;
let questionPosition;
let skipID;
let pageFrontendId;
let optionFrontendId;
let skipLogicIDs;
let questionsCount;
const messageSender = require('f7-utils').messageSender;

const mapToProject = (oldProject, project) => {
  project = Object.assign(project, {
    createdAt: oldProject.createdAt,
    updatedAt: oldProject.updatedAt,
    title: oldProject.title,
    languages: oldProject.languages,
    activeUntil: '2018-01-12T11:48:57.513Z',
    stats: {
      totalQuestionsCount: 0,
      totalResponsesCount: 0,
    },
    hasSignatureConfirmation: oldProject.signatureConfirmation,
    customization: {
      foregroundColor: oldProject.styles.display.primaryColor,
      backgroundColor: oldProject.styles.display.backgroundColor,
      question: {
        font: oldProject.styles.display.question.font,
        color: oldProject.styles.display.question.foregroundColor,
      },
      answer: {
        font: oldProject.styles.display.answer.font,
        color: oldProject.styles.display.answer.foregroundColor,
      },
      showNumbers: oldProject.styles.showNumbers === 'yes' ? true : false,
      paging: 'none',
      progressBar: {
        enabled: false,
      },
    },
    survey: {
      termsAndConditions: oldProject.welcome.termsAndConditions ? oldProject.welcome.termsAndConditions : '',
      welcomeText: oldProject.welcome.greetings ? oldProject.welcome.greetings : '',
      endOfSurveyText: oldProject.welcome.endOfSurvey ? oldProject.welcome.endOfSurvey : '',
      pages: [],
    },
  });
  if (oldProject.styles.progressBar === 'true') {
    project.customization.progressBar = {
      enabled: true,
      type: 'bar',
    };
  }
  if (oldProject.styles.logo.image) {
    const {align, image} = oldProject.styles.logo;
    project.logo = {
      align: align ? align : 'center',
      url: image,
    };
  }
};
const generateDecorator = oldQuestion => {
  let question = {};
  switch (oldQuestion.subtype) {
    case 'info':
      question = Object.assign(question, {
        position: questionPosition++,
        frontendId: skipID++,
        text: oldQuestion.title,
        type: 'decorator',
        subtype: 'information',
      });
      return question;
    default:
      console.log(`${oldQuestion.type} ${oldQuestion.subtype}`);
      process.exit(0);
  }
};
const getOptionsFromMultiple = oldOptions => {
  const options = [];
  let allAreNumbers = true;
  let hasOther = false;
  for (const position in oldOptions) {
    const option = oldOptions[position];

    if (parseFloat(option.displayValue) != option.displayValue) {
      allAreNumbers = false;
    }
    options.push({
      frontendId: ++optionFrontendId,
      position: fixRowIndexes(option.position),
      label: option.displayValue,
      isOtherOption: option.displayValue.trim().toUpperCase() === 'OTHER',
    });
    if (option.displayValue.trim().toUpperCase() === 'OTHER') {
      hasOther = true;
    }
  }
  return {options, allAreNumbers, hasOther};
};
const getOptionsFromMultipleImage = oldOptions => {
  const options = [];
  for (const position in oldOptions) {
    const option = oldOptions[position];
    options.push({
      frontendId: ++optionFrontendId,
      position: fixRowIndexes(option.position),
      label: option.displayValue,
      url: option.image,
    });
  }
  return options;
};
const generateMultipleQuestion = oldQuestion => {
  let question = {
    title: oldQuestion.title,
    position: questionPosition++,
    frontendId: skipID++,
    type: 'multiple',
    options: [],
  };
  if (oldQuestion.allowOther) {
    console.log(oldQuestion);
    process.exit(0);
  }
  switch (oldQuestion.subtype) {
    case 'text':
      const {options, allAreNumbers, hasOther} = getOptionsFromMultiple(oldQuestion.answerConfig.options);
      question = Object.assign(question, {
        subtype: allAreNumbers ? 'number' : 'text',
        options,
        config: {
          minResponses: 1,
          maxResponses: oldQuestion.constraints.maxResponses, // multiple-*
          displayAs: oldQuestion.additionalConfig.displayAsDropDown ? 'dropDown' : 'list',
          required: oldQuestion.isRequired,
          allowOther: hasOther,
          allowNA: false,
        },
      });
      return question;
    case 'image':
      question = Object.assign(question, {
        subtype: 'text',
        config: {
          minResponses: 1,
          maxResponses: oldQuestion.constraints.maxResponses, // multiple-*
          required: oldQuestion.isRequired,
          allowNA: false,
        },
      });
      question.options = getOptionsFromMultipleImage(oldQuestion.answerConfig.options);
      return question;
    default:
      console.log(`${oldQuestion.type} ${oldQuestion.subtype}`);
      process.exit(0);
  }
};
const generateSimpleQuestion = oldQuestion => {
  let question = {
    title: oldQuestion.title,
    position: questionPosition++,
    frontendId: skipID++,
    type: 'input',
  };
  switch (oldQuestion.subtype) {
    case 'text':
      question = Object.assign(question, {
        subtype: 'text',
        config: {
          maxLenght: parseInt(oldQuestion.constraints.length),
          required: oldQuestion.isRequired,
          allowNA: false,
        },
      });
      return question;
    default:
      console.log(`${oldQuestion.type} ${oldQuestion.subtype}`);
      process.exit(0);
  }
};
const generateRankQuestion = oldQuestion => {
  let question = {
    title: oldQuestion.title,
    position: questionPosition++,
    frontendId: skipID++,
    type: 'rank',
    options: [],
    config: {
      required: oldQuestion.isRequired,
      allowNA: false,
    },
  };
  switch (oldQuestion.subtype) {
    case 'rank':
      const {options, allAreNumbers, hasOther} = getOptionsFromMultiple(oldQuestion.answerConfig.options);
      question.options = options;
      return question;
    default:
      console.log(`${oldQuestion.type} ${oldQuestion.subtype}`);
      process.exit(0);
  }
};
const getRows = oldRows => {
  const rows = [];
  for (const rowPosition in oldRows) {
    const row = oldRows[rowPosition];
    rows.push({
      frontendId: ++optionFrontendId,
      label: row.title,
      position: row.position,
    });
  }
  return fixRowIndexes(rows);
};
const fixRowIndexes = rows => {
  let shouldReindex = false;
  for (const position in rows) {
    if (rows[position].position == 0) {
      shouldReindex = true;
      break;
    }
  }
  if (!shouldReindex) {
    return rows;
  }
  for (const position in rows) {
    rows[position].position++;
  }
  return rows;
};
const generateGridQuestion = oldQuestion => {
  let question = {
    title: oldQuestion.title,
    position: questionPosition++,
    frontendId: skipID++,
    type: 'grid',
    config: {
      required: oldQuestion.isRequired,
      allowNA: false,
      shouldForceRanking: oldQuestion.additionalConfig.shouldForceRanking,
      leftLabel: oldQuestion.constraints.leftValue, // scale, grid
      rightLabel: oldQuestion.constraints.rightValue, // scale, grid
      displayAs: oldQuestion.additionalConfig.displayInSingleRow ? 'singleRow' : 'multipleRow',
    },
  };
  switch (oldQuestion.subtype) {
    case 'grid':
      question.rows = getRows(oldQuestion.answerConfig.rows);
      const {options, allAreNumbers, hasOther} = getOptionsFromMultiple(oldQuestion.answerConfig.options);
      question.options = options;
      return question;
    default:
      console.log(`${oldQuestion.type} ${oldQuestion.subtype}`);
      process.exit(0);
  }
};
const generateScaleAndNumericQuestion = oldQuestion => {
  let question = {
    title: oldQuestion.title,
    position: questionPosition++,
    frontendId: skipID++,
    type: 'scale',
    options: [],
    config: {
      required: oldQuestion.isRequired,
      allowNA: false,
      minValue: oldQuestion.constraints.minValue, // scale, input-number
      maxValue: oldQuestion.constraints.granularity, // scale, input-number
    },
  };
  switch (oldQuestion.subtype) {
    case 'stars':
      question.config.granularity = 0.5; // scale
      question.subtype = 'icon';
      question.config.displayAs = 'star';
      return question;
    case 'sliding':
      question.subtype = 'slider';
      question.config.granularity = 0.5; // scale
      question.config.leftLabel = oldQuestion.constraints.leftValue;
      question.config.rightLabel = oldQuestion.constraints.rightValue; // scale, grid
      return question;
    case 'numeric':
      question.type = 'input';
      question.subtype = 'number';
      question.config.allowDecimals = oldQuestion.constraints.allowDecimals; // input-number, multiple-number
      question.config.maxValue = oldQuestion.constraints.maxValue;
      question.config.leftLabel = oldQuestion.constraints.leftValue;
      question.config.rightLabel = oldQuestion.constraints.rightValue; // scale, grid
      delete question.options;
      return question;
    default:
      console.log(`${oldQuestion.type} ${oldQuestion.subtype}`);
      process.exit(0);
  }
};
const fixSkipLogicIDsForQuestion = question => {
  if (question.skipLogic.length === 0) {
    return question;
  }
  const skipLogic = [];
  for (const indexSkipLogic in question.skipLogic) {
    const item = question.skipLogic[indexSkipLogic];
    item.target = skipLogicIDs[parseInt(item.target)];
    if (!item.target) {
      console.log(question, skipLogicIDs);
      process.exit(0);
    }
    skipLogic.push(item);
  }
  question.skipLogic = skipLogic;
  return question;
};
const fixSkipLogicIDS = project => {
  for (const pageIndex in project.survey.pages) {
    for (const itemIndex in project.survey.pages[pageIndex].items) {
      project.survey.pages[pageIndex].items[itemIndex] = fixSkipLogicIDsForQuestion(project.survey.pages[pageIndex].items[itemIndex]);
    }
  }
};
const addSkipLogic = (question, oldQuestion) => {
  skipLogicIDs[parseInt(oldQuestion.position)] = skipID - 1;
  question.skipLogic = [];
  if (!oldQuestion.skipLogic || oldQuestion.skipLogic.length === 0) {
    return;
  }
  oldQuestion.skipLogic.forEach(item => {
    delete item._id;
    if (item.option !== undefined) {
      if (question.type === 'multiple') {
        if (question.subtype === 'text' || question.subtype === 'image') {
          item.option = parseInt(item.option) + 1;
        } else {
          item.option = parseInt(item.option) + 1; // ?
        }
      } else if ((question.type === 'input' && question.subtype === 'number') || question.type === 'scale') {
        item.expresion.value1 = parseFloat(item.expresion.value1);
        item.expresion.value2 = parseFloat(item.expresion.value2);
      } else if (question.type === 'grid') {
        item.option = parseInt(item.option) + 1;
        item.value = parseInt(item.value) + 1;
      }
    }
    question.skipLogic.push(item);
  });
};
const generateProject = async (projectId, oldDB) => {
  pageFrontendId = 0;
  optionFrontendId = 0;
  skipLogicIDs = {};
  const project = {
    _id: new ObjectID(projectId),
  };
  const projectDoc = await oldDB.collection('projects').findOne({_id: new ObjectID(projectId)});
  mapToProject(projectDoc, project);

  const pageDoc = await oldDB.collection('pages').findOne({_id: new ObjectID(projectDoc.pages[0])});
  const pages = [];
  pagePosition = 1;
  skipID = 1;
  questionsCount = 0;
  let page = {
    position: pagePosition++,
    title: pageDoc.title,
    items: [],
    frontendId: ++pageFrontendId,
  };
  questionPosition = 1;
  console.log(`project ${projectId}`);
  const questionsIds = pageDoc.questions;
  pageDoc.questions.forEach(item => {
    questionsIds.push(new ObjectID(item));
  });
  const questions = await oldDB
    .collection('questions')
    .find({_id: {$in: questionsIds}})
    .sort({
      position: 1,
    });
  let oldQuestion;
  while ((oldQuestion = await questions.next())) {
    if (!oldQuestion) {
      continue;
    }
    let question;
    switch (oldQuestion.type) {
      case 'decorator':
        if (oldQuestion.subtype === 'section') {
          skipLogicIDs[parseInt(oldQuestion.position)] = skipID + 1;
          project.survey.pages.push(page);
          page = {
            position: pagePosition++,
            title: oldQuestion.title,
            items: [],
            frontendId: ++pageFrontendId,
          };
          questionPosition = 1;
          continue;
        } else {
          question = generateDecorator(oldQuestion);
        }
        break;
      case 'multiple':
        question = generateMultipleQuestion(oldQuestion);
        questionsCount++;
        break;
      case 'simple':
        question = generateSimpleQuestion(oldQuestion);
        questionsCount++;
        break;
      case 'rank':
        question = generateRankQuestion(oldQuestion);
        questionsCount++;
        break;
      case 'grid':
        question = generateGridQuestion(oldQuestion);
        questionsCount++;
        break;
      case 'numeric':
        question = generateScaleAndNumericQuestion(oldQuestion);
        questionsCount++;
        break;
      default:
        console.log(oldQuestion.type);
        process.exit(0);
    }
    question._id = oldQuestion._id;
    addSkipLogic(question, oldQuestion);
    page.items.push(question);
  }
  fixSkipLogicIDS(project);
  project.stats.totalQuestionsCount = questionsCount;
  project.survey.pages.push(page);
  return project;
};
const createMembersAndFolders = async (projectId, oldDB, newDB) => {
  const projectMembersCollection = oldDB.collection('projectmembers');
  const resourcesMappingCollection = newDB.collection('ResourcesMapping');
  const data = await projectMembersCollection.find({projectId: projectId}).toArray();
  for (let i = 0; i < data.length; i++) {
    const {role, userId, projectId} = data[i];
    let {folder} = data[i];
    if (folder.toString() === '58808f1fd36f073e7679efb5' || folder.toString() === '58808f1fd36f073e7679efb6') {
      folder = 'f00000000000000000000001';
    }
    if (role === null || !projectId || !userId || !folder) {
      continue;
    }
    const resourcesMapping = {
      userId: new ObjectID(userId),
      projectId: new ObjectID(projectId),
      folderId: new ObjectID(folder),
      accessType: role.toLowerCase(),
    };
    await resourcesMappingCollection.findOneAndUpdate(
      {
        userId: resourcesMapping.userId,
        projectId: resourcesMapping.projectId,
        folderId: resourcesMapping.folderId,
      },
      resourcesMapping,
      {upsert: true}
    );
  }
};
const exec = async () => {
  const oldDB = await MongoClient.connect('mongodb://172.17.0.2/frontier7-survey');
  const newDB = await MongoClient.connect('mongodb://172.17.0.2/f7-projects');
  const oldProjectCollection = oldDB.collection('projects');
  const projectCollection = newDB.collection('Project');
  const projects = [
    {_id: new ObjectID('58b1bfa363d53c679fd138f6')},
    {_id: new ObjectID('58e90df651beeb2cc5fa891b')},
    {_id: new ObjectID('58cadaf102716702f37e5817')},
    {_id: new ObjectID('58ea17c951beeb2cc5facfa7')},
    {_id: new ObjectID('593a0957739ec7180d1ff9c9')},
    {_id: new ObjectID('593c328e7942855895dd1f83')},
    {_id: new ObjectID('593b0fd67942855895dc7644')},
    {_id: new ObjectID('593a0065739ec7180d1fda71')},
    {_id: new ObjectID('593daa147942855895de9a14')},
    {_id: new ObjectID('593b4c2c7942855895dcb740')},
    {_id: new ObjectID('593d377f7942855895ddf923')},
    {_id: new ObjectID('593d89347942855895de3bd3')},
    {_id: new ObjectID('589afc480326a845afac1bd5')},
    {_id: new ObjectID('5930283803cc6b3e7d613684')}, // TEST
    {_id: new ObjectID('58c84792625aad2972eea5da')},
  ];

  for (let i = 0; i < projects.length; i++) {
    const project = await generateProject(projects[i]._id, oldDB);

    const result = await projectCollection.findOneAndUpdate({_id: projects[i]._id}, project, {upsert: true});
    await createMembersAndFolders(projects[i]._id, oldDB, newDB);

    if (result.value === null) {
      continue;
    }
    // await messageSender.sendProjectConfigMessages(project.survey.pages, project._id);
  }
  oldDB.close();
  console.log('close connection');
  process.exit(0);
};

exec();
