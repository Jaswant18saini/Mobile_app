import React from 'react';
import {WebView} from 'react-native-webview';
import {AUTH_URL} from '@env';

const Login = () => {
  console.log(AUTH_URL);
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
