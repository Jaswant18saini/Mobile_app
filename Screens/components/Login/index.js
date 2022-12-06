import React from 'react';
import {WebView} from 'react-native-webview';
// import {AUTH_URL} from '@env';

const Login = () => {
  // console.log(AUTH_URL);
  const CLIENT_ID = '3MVG9RezSyZYLh2uCLY.LsKGxySkKzZBiHV8luYqMgeeI77I5jfamuycuMsqiL_XOZqqab.Aqvw==';
  const CALLBACK = encodeURIComponent('com.pspdfkitdemo://oauth');
  const AUTH_URL = 'https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id='+CLIENT_ID+'&redirect_uri='+CALLBACK;
    console.log("AUTH_URL",AUTH_URL);
  return (
    <>
      {AUTH_URL && (
        <WebView
          source={{
            uri: AUTH_URL,
          }}
        />
      )}
    </>
  );
};
export default Login;
