# f7-projects-api

Frontier 7 projects management service built upon NodeJS/Loopback.

### Setup environment

The next environment variables must be set:

| Variable    | Value                     |
| :---------- | :------------------------ |
| MONGODB_URL | 'Database connection url' |

### Install dependencies

```sh
$ yarn
```

### Start the app

```sh
$ yarn start
```

### Crate a new model

```sh
$ yarn model ModelName
```

It will generate a folder in the app/resources directory. By default the model will be based on PersistedModel and it will connect to the mongodb datasource.

> It is not part of the loopback framework, it is a custom script built for this template.

### Project model

```json
{
  "_id": "58776d2822d167735d89b640",
  "createdAt": "2017-01-12T11:48:57.513Z",
  "title": "Project Title",
  "logo": {
    "url": "url",
    "align": "center"
  },
  "customization": {
    "foregroundColor": "#009688",
    "backgroundColor": "#ffffff",
    "question": {
      "font": "Ubuntu",
      "color": "#000"
    },
    "answer": {
      "font": "Dosis",
      "color": "#000"
    },
    "showNumbers": false,
    "paging": "none",
    "progressBar": {
      "enabled": true,
      "type": "bar"
    }
  },
  "languages": ["en", "es"],
  "activeUntil": "2018-01-12T11:48:57.513Z",
  "isSkipLogicEnabled": true,
  "isTranslationEnabled": true,
  "hasSignatureConfirmation": false,
  "hasLanguages": false,
  "hasSkipLogic": false,
  "stats": {
    "totalQuestionsCount": 10,
    "totalResponsesCount": 4,
    "totalTimeToComplete": 223 // in seconds
  },
  "skipLogic": {
    "frontendId": {
      "type": "unconditional",
      "skipTo": "frontendId"
    },
    "frontendId": {
      "type": "byOption",
      "jumps": [
        {
          "options": [1, 3],
          "skipTo": "frontendId",
          "areOptionsSelected": true
        },
        {
          "options": ["na"],
          "skipTo": "frontendId"
        }
      ]
    },
    "frontendId": {
      "type": "byExpression",
      "jumps": [
        {
          "expression": {
            "valueOperator1": ">",
            "value1": 4,
            "groupOperator": "&&",
            "valueOperator2": "<",
            "value2": 8
          },
          "skipTo": "frontendId"
        },
        {
          "skipTo": "frontendId" // for NA
        }
      ]
    }
  },
  "survey": {
    "termsAndConditions": "terms",
    "welcomeText": "welcome!",
    "endOfSurveyText": "bye!",
    "pages": [
      {
        "position": 1,
        "title": "Page 1 title",
        "items": [
          {
            "position": 1,
            "type": "multiple", // multiple, input, scale, grid, rank
            "subtype": "image", // multiple(text, number, image), input(text, number)
            "title": "Question title",
            "frontendId": 23123,
            "options": [
              // multiple-*, ranking
              {
                "position": 1,
                "label": "First option",
                "isOther": true, // flag to know if the option is an 'Other' option (only for multiple)
                "url": ""
              }
            ],
            "columns": [
              // grid
              {
                "position": 1,
                "label": "First option"
              }
            ],
            "rows": [
              // grid
              {
                "position": 1,
                "label": "First option"
              }
            ],
            "config": {
              "minResponses": 1, // multiple-*
              "maxResponses": 2, // multiple-*
              "maxLength": 100, // input-text
              "minValue": 1, // scale(stars, slider), input-number
              "maxValue": 10, // scale(stars, slider), input-number
              "leftLabel": "left label", // scale(slider), grid
              "rightLabel": "right label", // scale(slider), grid
              "granularity": 1, // scale
              "allowDecimals": false, // input-number, multiple-number
              "shouldForceRanking": false, // grid
              "displayAs": "stars", // scale(stars, slider), grid(singleRow, multipleRow), multple(dropDown, list))
              "isRequired": true, // all
              "allowOther": true, // multiple-*
              "allowNA": true // all
            }
          },
          {
            "position": 2, // decorator-*
            "frontendId": 23123,
            "type": "decorator",
            "subtype": "info",
            "text": "html content"
          }
        ]
      }
    ]
  }
}
```

### Language model

```json
{
  "_id": "",
  "projectId": "",
  "title": "translation",
  "language": "es",
  "welcome": {
    "greetings": "translation",
    "termsAndConditions": "translation"
  },
  "endOfSurvey": "translation",
  "items": {
    "frontendId1": "translation",
    "frontendId2": "translation",
    "frontendId3": "translation"
  },
  "uiTags": {
    // injected by backend when fetching
    "next": "Next",
    "prev": "Prev",
    "agree": "Agree",
    "submit": "Submit",
    "disagree": "Disagree",
    "inputPlaceholder": "Your answer here",
    "rankPlaceholder": "Drag and Drop Options Here",
    "termsAndConditionsModalTitle": "Terms and conditions",
    "termsAndConditionsLabel": "I agree with Terms And Conditions"
  }
}
```
