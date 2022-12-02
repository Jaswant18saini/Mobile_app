import React from 'react';
import {WebView} from 'react-native-webview';
// import {AUTH_URL} from '@env';

const Login = () => {
  // console.log(AUTH_URL);
  const AUTH_URL =
    'https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id=3MVG9wt4IL4O5wvKO2JUZnYYNyI7XJuNh_ZPFmHs1gHytxLtJq3t.tqpfDC8_rlXh50Xngz0R9xBR_HhMZwat&redirect_uri=https://presonal-dev-ed.my.salesforce.com/services/authcallback/demo&state=mystate';
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
