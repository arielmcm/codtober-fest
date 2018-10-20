const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const useragent = require('useragent');
const messageSender = require('f7-utils').messageSender;

const generateDataForMultiple = record => {
  const data = {
    answers: {},
  };
  const answersCount = record.answers.length;
  for (var index = 0; index < answersCount; index++) {
    const answer = record.answers[index];
    if (answer.question[0].type === 'multiple') {
      if (data.answers[`q${answer.questionId}`] === undefined) {
        data.answers[`q${answer.questionId}`] = {values: [], na: false};
      }
      data.answers[`q${answer.questionId}`].values.push(answer.assignedOptionValue);
    }
  }
  return data;
};
const distributionTypes = {
  SMS: 'sms',
  PUBLIC: 'web',
  EMAIL: 'email',
};
const completeDistributionInfo = async (data, oldDB, record) => {
  const {distributionRecipientDetailId} = record;
  const distributionrecipientdetailsCollection = oldDB.collection('distributionrecipientdetails');
  const distributionrecipientdetail = await distributionrecipientdetailsCollection.findOne({_id: new ObjectID(distributionRecipientDetailId)});

  data.distributionInfo.type = distributionTypes[distributionrecipientdetail.channel];
  data.campaign = distributionrecipientdetail.distributionId;
  if (data.distributionInfo.type !== 'web') {
    data.recipientId = distributionrecipientdetail.recipientId;
    data.listId = null;
  }
  // const startTime = moment(distributionrecipientdetail.firstOpenedTime);
  // const endTime = moment(distributionrecipientdetail.firstCompletionDate);
  // data.timeToComplete = endTime.diff(startTime, 'seconds');
};
const generateMainData = async (record, oldDB) => {
  const userAgent = record.clientMetadata ? record.clientMetadata.userAgent : 'unknown';
  const ipAddress = record.ipAddress ? record.clientMetadata.ipAddress : '0.0.0.0';
  const city = record.ipAddress ? record.clientMetadata.city : '--';
  const country = record.ipAddress ? record.clientMetadata.country : '--';
  const latitude = record.ipAddress ? record.clientMetadata.latitude : '0';
  const longitude = record.ipAddress ? record.clientMetadata.longitude : '0';
  const browser = useragent.parse(userAgent);
  delete browser.source;
  const data = {
    projectId: record.projectId,
    createdAt: moment(record.createdAt)
      .utc()
      .toDate(),
    timeToComplete: 0,
    requestData: {
      ipAddress,
      userAgent,
      browser,
      city,
      country,
      latitude,
      longitude,
    },
    distributionInfo: {
      type: 'web',
    },
    answers: {},
  };
  await completeDistributionInfo(data, oldDB, record);
  return data;
};
const generateDataForScale = record => {
  const data = {
    multipleSelectionQuestion: {},
    answers: {},
  };
  const answersCount = record.answers.length;
  for (var index = 0; index < answersCount; index++) {
    const answer = record.answers[index];
    if (answer.question[0].type === 'multiple') {
      if (data.multipleSelectionQuestion[`q${answer.questionId}`] === undefined) {
        data.multipleSelectionQuestion[`q${answer.questionId}`] = [];
      }
      const {assignedOptionValue} = answer;
      const q = `q${answer.questionId}`;
      data.multipleSelectionQuestion[q].push(assignedOptionValue);
    }
    if (answer.question[0].type === 'numeric' && (answer.question[0].subtype === 'sliding' || answer.question[0].subtype === 'stars')) {
      data.answers[`q${answer.questionId}`] = {value: answer.selectedOptionActualValue, na: false};
    }
  }
  return data;
};
const generateDataForRank = (record, questions) => {
  const data = {
    answers: {},
  };
  const answersCount = record.answers.length;
  for (var index = 0; index < answersCount; index++) {
    const answer = record.answers[index];
    if (answer.question[0].type === 'rank') {
      if (data.answers[`q${answer.questionId}`] === undefined) {
        data.answers[`q${answer.questionId}`] = {
          values: [],
          na: false,
        };
      }
      data.answers[`q${answer.questionId}`].values.push({
        position: questions[answer.questionId][answer.selectedOptionActualValue],
        selection: answer.assignedOptionValue + 1,
      });
    }
  }
  return data;
};
const generateDataForNumber = record => {
  const data = {
    answers: {},
  };
  const answersCount = record.answers.length;
  for (var index = 0; index < answersCount; index++) {
    const answer = record.answers[index];
    if (answer.question[0].type === 'numeric' && answer.question[0].subtype === 'numeric') {
      data.answers[`q${answer.questionId}`] = {
        value: answer.selectedOptionActualValue,
        na: false,
      };
    }
  }
  return data;
};
const generateDataForText = record => {
  const data = {
    answers: {},
  };
  const answersCount = record.answers.length;
  for (var index = 0; index < answersCount; index++) {
    const answer = record.answers[index];
    if (answer.question[0].type === 'simple' && answer.question[0].subtype === 'text') {
      data.answers[`q${answer.questionId}`] = {
        value: answer.selectedOptionActualValue,
        na: false,
      };
    }
  }
  return data;
};
const fixRowIndexes = rows => {
  const rowsIDs = Object.keys(rows);
  let shouldReindex = false;
  for (const position in rowsIDs) {
    const rowID = rowsIDs[position];
    if (rowID === '0') {
      shouldReindex = true;
      break;
    }
  }
  if (!shouldReindex) {
    return rows;
  }
  const rowsReindexed = {};
  for (const position in rowsIDs) {
    const rowID = parseInt(rowsIDs[position]) + 1;
    rowsReindexed[`${rowID}`] = rows[rowsIDs[position]];
  }
  return rowsReindexed;
};
const fixRowsIndexes = data => {
  const questionsIDs = Object.keys(data.answers);
  for (const position in questionsIDs) {
    const rows = data.answers[questionsIDs[position]];
    data.answers[questionsIDs[position]].values = fixRowIndexes(rows.values);
  }
};
const generateDataForGrid = (record, questions) => {
  const data = {
    answers: {},
  };
  const answersCount = record.answers.length;
  for (var index = 0; index < answersCount; index++) {
    const answer = record.answers[index];
    if (answer.question[0].type === 'grid') {
      if (data.answers[`q${answer.questionId}`] === undefined) {
        data.answers[`q${answer.questionId}`] = {
          values: {},
          na: false,
        };
      }
      const rowID = answer.assignedRowValue;
      data.answers[`q${answer.questionId}`].values[`${rowID}`] = answer.selectedOptionPosition;
    }
  }
  fixRowsIndexes(data);
  return data;
};

const generateProject = async (projectId, oldDB) => {
  const questions = {};
  const project = {
    _id: new ObjectID(projectId),
    questions: {},
  };
  const projectDoc = await oldDB.collection('projects').findOne({_id: new ObjectID(projectId)});
  const page = await oldDB.collection('pages').findOne({_id: new ObjectID(projectDoc.pages[0])});
  for (const index in page.questions) {
    const question = await oldDB.collection('questions').findOne({_id: new ObjectID(page.questions[index])});
    if (question && question.type === 'rank') {
      questions[question._id] = {};
      project.questions[question._id] = question.answerConfig.options.length;
      for (let i = 0; i < project.questions[question._id]; i++) {
        const response = question.answerConfig.options[i];
        questions[question._id][response.title] = response.position;
      }
    }
  }
  return {project, questions};
};

const exec = async () => {
  const url = 'mongodb://172.17.0.2/frontier7-survey';
  const oldDB = await MongoClient.connect(url);

  const urlResponses = 'mongodb://172.17.0.2/f7-responses';
  const dbResponses = await MongoClient.connect(urlResponses);
  const urlProjects = 'mongodb://172.17.0.2/f7-projects';
  const dbProjects = await MongoClient.connect(urlProjects);

  const oldProjectCollection = oldDB.collection('projects');
  const projects = [
    {_id: new ObjectID('58cadaf102716702f37e5817')}, // scale
    {_id: new ObjectID('58b1bfa363d53c679fd138f6')},
    {_id: new ObjectID('593b0fd67942855895dc7644')}, // grid
    {_id: new ObjectID('58e90df651beeb2cc5fa891b')},
    {_id: new ObjectID('58ea17c951beeb2cc5facfa7')},
    {_id: new ObjectID('593a0957739ec7180d1ff9c9')},
    {_id: new ObjectID('593c328e7942855895dd1f83')},
    {_id: new ObjectID('593a0065739ec7180d1fda71')},
    {_id: new ObjectID('593daa147942855895de9a14')},
    {_id: new ObjectID('593b4c2c7942855895dcb740')},
    {_id: new ObjectID('593d377f7942855895ddf923')},
    {_id: new ObjectID('593d89347942855895de3bd3')},
    {_id: new ObjectID('589afc480326a845afac1bd5')},
    {_id: new ObjectID('5930283803cc6b3e7d613684')}, // TEST
    {_id: new ObjectID('58c84792625aad2972eea5da')},
  ];

  const responseanswersCollection = oldDB.collection('responsesummaries');
  const responsesCollection = dbResponses.collection('Response');
  const newProjectCollection = dbProjects.collection('projects');

  responsesCollection.drop();
  let totalRecords = 0;
  for (let i = 0; i < projects.length; i++) {
    const {project, questions} = await generateProject(projects[i]._id, oldDB);
    const projectDoc = await newProjectCollection.findOne({_id: projects[i]._id});
    const submits = await responseanswersCollection.find({
      projectId: projects[i]._id,
    });
    let totalRecordsPerProject = 0;
    for (let submit = await submits.next(); submit != null; submit = await submits.next()) {
      const mainData = await generateMainData(submit, oldDB);
      const dataForScale = generateDataForScale(submit);
      const {multipleSelectionQuestion} = dataForScale;
      const dataForMultiple = generateDataForMultiple(submit);
      const dataForRank = generateDataForRank(submit, questions);
      const dataForNumber = generateDataForNumber(submit);
      const dataForText = generateDataForText(submit);
      const dataForGrid = generateDataForGrid(submit);
      mainData.answers = Object.assign(mainData.answers, dataForScale.answers);
      mainData.answers = Object.assign(mainData.answers, dataForMultiple.answers);
      mainData.answers = Object.assign(mainData.answers, dataForRank.answers);
      mainData.answers = Object.assign(mainData.answers, dataForNumber.answers);
      mainData.answers = Object.assign(mainData.answers, dataForText.answers);
      mainData.answers = Object.assign(mainData.answers, dataForGrid.answers);
      await responsesCollection.insert(mainData);
      totalRecordsPerProject++;
      totalRecords++;
      // await messageSender.sendCaptureMessages(mainData, projectDoc.survey.pages);
    }
    console.info(`Project ${projects[i]._id}: ${totalRecordsPerProject}`);
  }
  console.info(`TotalRecords ${totalRecords}`);

  oldDB.close();
  console.log('close connection');
  process.exit(0);
};

exec();
