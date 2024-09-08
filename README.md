# README

## Purpose
Test the code from agora quick start guide  
https://docs.agora.io/en/voice-calling/get-started/get-started-sdk?platform=react-native  
in expo
https://www.agora.io/en/blog/building-a-video-calling-app-using-the-agora-sdk-on-expo-react-native/

## install
run `npm install`

## .env
create `.env` file in root level, include `EXPO_PUBLIC_APP_ID`, `EXPO_PUBLIC_TOKEN` and `EXPO_PUBLIC_TESTNAME`. App ID and Public TOken are from Agora console, reg and generate it from agora console. Testname is just a string to test if the app getting env value from `.env` or `eas.json`

## eas.json
eas.json is a file for building the actual app through EAS Build but not only run a development build. In EAS build pipeline, `.env` will not get uploaded to the build pipeline so that we need to include production env vars in eas.json.  

Therefore, in dev build from command like "npx expo run:android", env var will be fetching from `.env`, and in "eas build", env vars will be from `eas.json`

create `eas.json` file in root level, add:
```
{
  "cli": {
    "version": ">= 7.3.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_TESTNAME": "<SOME_STRING>",
        "EXPO_PUBLIC_APP_ID": "<APP_ID>",
        "EXPO_PUBLIC_TOKEN": "<TEMP_TOKEN>"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}

```

## run
`npm run a` to run the app on android simulator

## stop
`ctrl c` to stop on mac

## expect
- app can run
- can join a chat channel
- can leave the channel
- suppose two app in the same channel can talk