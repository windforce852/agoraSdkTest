import { Image, StyleSheet, View, Text, Pressable, ScrollView, TextInput, Dimensions } from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { useRef, useState, useEffect } from 'react';

import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
  RtcConnection,
  IRtcEngineEventHandler,
} from 'react-native-agora';

// Define basic information
// export const appId = process.env.EXPO_PUBLIC_APP_ID;
// export const token = process.env.EXPO_PUBLIC_TOKEN;
// export const channelName = 'test';
// export const uid = 0; // Local user Uid, no need to modify

const { width, height } = Dimensions.get('window');

export const appId = "52904c6509174b7ea50b0ba49c79c7b4"
// export const token = "00652904c6509174b7ea50b0ba49c79c7b4IABFAExpWIIG5SETbVUk/PXQlG931Ma9djAejkywYepwyj6q6tDbbJCkIgBksuF9s/AEZwQAAQAbowNnAgAbowNnAwAbowNnBAAbowNn"
// export const channelName = "Suceess1"
// export const uid = 0

export default function HomeScreen() {
  const agoraEngineRef = useRef<IRtcEngine>(); // IRtcEngine instance
  const [isJoined, setIsJoined] = useState(false); // Whether the local user has joined the channel
  const [isHost, setIsHost] = useState(true); // User role
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
  const [message, setMessage] = useState(''); // User prompt message
  const [errorCode, setErrorCode] = useState('');
  const eventHandler = useRef<IRtcEngineEventHandler>(); // Callback functions

    // State variables for dynamic input
    const [inputToken, setInputToken] = useState('');
    const [inputChannelName, setInputChannelName] = useState('');
    const [inputUid, setInputUid] = useState('');
  
    // State variables to store the actual token, channelName, and uid after pressing the button
    const [token, setToken] = useState('');
    const [channelName, setChannelName] = useState('');
    const [uid, setUid] = useState(0);


  useEffect(() => {
    // Initialize the engine when the App starts
    setupVideoSDKEngine();
    // Release memory when the App is closed
    return () => {
      agoraEngineRef.current?.unregisterEventHandler(eventHandler.current!);
      agoraEngineRef.current?.release();
    };
  }, []);


  
  // Define the setupVideoSDKEngine method called when the App starts
  const setupVideoSDKEngine = async () => {
    try {
      // Create RtcEngine after obtaining device permissions
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      eventHandler.current = {
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined channel: ' + channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection: RtcConnection, uid: number) => {
          showMessage('Remote user ' + uid + ' joined');
          setRemoteUid(uid);
        },
        onUserOffline: (_connection: RtcConnection, uid: number) => {
          showMessage('Remote user ' + uid + ' left the channel');
          setRemoteUid(0);
        },
      };
      // Register the event handler
      agoraEngine.registerEventHandler(eventHandler.current);
      // Initialize the engine
      agoraEngine.initialize({
        appId: appId,
      });
    } catch (e) {
      console.log(e);
    }
  };


  // Define the join method called after clicking the join channel button
  const join = async () => {
    console.log('join clicked')
    if (isJoined) {
      return;
    }
    try {
      if (isHost) {
        console.log('is host')
        // Join the channel as a broadcaster
        const result = agoraEngineRef.current?.joinChannel(token, channelName, uid, {
          // Set channel profile to live broadcast
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          // Set user role to broadcaster
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          // Publish audio collected by the microphone
          publishMicrophoneTrack: true,
          // Automatically subscribe to all audio streams
          autoSubscribeAudio: true,
        });
        setErrorCode(result?.toString() || "");
      } else {
        // Join the channel as an audience
        const result = agoraEngineRef.current?.joinChannel(token, channelName, uid, {
          // Set channel profile to live broadcast
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          // Set user role to audience
          clientRoleType: ClientRoleType.ClientRoleAudience,
          // Do not publish audio collected by the microphone
          publishMicrophoneTrack: false,
          // Automatically subscribe to all audio streams
          autoSubscribeAudio: true,
        });
        setErrorCode(result?.toString() || "");
      }
    } catch (e) {
      console.log('catching')
      console.log(e);
    }
  };


  // Define the leave method called after clicking the leave channel button
  const leave = () => {
    console.log('leave clicked')
    try {
      // Call leaveChannel method to leave the channel
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage('Left the channel');
    } catch (e) {
      console.log(e);
    }
  };

  const setupCredentials = () => {
    setToken(inputToken);
    setChannelName(inputChannelName);
    setUid(Number(inputUid));
    console.log(`setup cred: ${inputToken}, ${inputChannelName}, ${inputUid}`)
  };


  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View style={{height: 40}}></View>
      <Text style={styles.head}>Agora Voice Calling Quickstart</Text>
      <Text>{`ENV test: ${process.env.EXPO_PUBLIC_TESTNAME || "empty"}`}</Text>
      <View style={{height: 40}}></View>
      <View style={styles.btnContainer}>
        <Text onPress={
          join
        } style={styles.button}>
          Join Channel
        </Text>
        <Text onPress={
          leave
        } style={styles.button}>
          Leave Channel
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}>
        {isJoined ? (
          <Text>Local user uid: {uid}</Text>
        ) : (
          <Text>Join a channel</Text>
        )}
        {isJoined && remoteUid !== 0 ? (
          <Text>Remote user uid: {remoteUid}</Text>
        ) : (
          <Text>Waiting for remote user to join</Text>
        )}
        <Text>{`Join Response Code: ${errorCode}`}</Text>
        <Text>{message}</Text>
        

        <View style={{ width: width * 0.8, justifyContent: "center", alignItems: "center"}}>
          <Text>Token</Text>
        <TextInput
            placeholder="Enter Token"
            value={inputToken}
            onChangeText={setInputToken} // Updates inputToken state
            style={styles.input}
          />
          <Text>Channel Name</Text>
          <TextInput
            placeholder="Enter Channel Name"
            value={inputChannelName}
            onChangeText={setInputChannelName} // Updates inputChannelName state
            style={styles.input}
          />
          <Text>UID</Text>
          <TextInput
            placeholder="Enter UID"
            value={inputUid}
            onChangeText={setInputUid} // Updates inputUid state
            style={styles.input}
            keyboardType="numeric"
          />
          <Pressable onPressOut={setupCredentials}>
            <Text style={{color: "green"}}>Setup cred</Text>
          </Pressable>
        </View>
      </ScrollView>

    </View>
  );

  // Display information
  function showMessage(msg: string) {
    setMessage(msg);
  }
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 25,
    paddingVertical: 4,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#0055cc',
    margin: 5,
  },
  main: { flex: 1, alignItems: 'center' },
  scroll: { flex: 1, backgroundColor: '#ddeeff', width: '100%' },
  scrollContainer: { alignItems: 'center' },
  videoView: { width: '90%', height: 200 },
  btnContainer: { flexDirection: 'row', justifyContent: 'center' },
  head: { fontSize: 20 },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
});
const getPermission = async () => {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
  }
};