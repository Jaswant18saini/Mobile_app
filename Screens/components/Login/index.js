import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import * as querystring from 'query-string';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({setIsLogin}) => {
  const [token, setToken] = useState(null);

  const navigation = useNavigation();

  const onNavigationStateChange = event => {
    if (event.url.includes('http://localhost:3002')) {
      const loginInfo = querystring.parse(event.url.split('#')[1]);
      if (loginInfo?.access_token) {
        setIsLogin(true);
        setToken(loginInfo?.access_token);
        AsyncStorage.setItem('loginInfo', JSON.stringify(loginInfo));
        navigation.navigate('Documents');
      }
    }
  };
  const AUTH_URL =
    'https://test.salesforce.com/services/oauth2/authorize?response_type=token&client_id=3MVG9RezSyZYLh2uCLY.LsKGxySkKzZBiHV8luYqMgeeI77I5jfamuycuMsqiL_XOZqqab.Aqvw==&redirect_uri=http://localhost:3002';

  return (
    <View style={{flex: 1, paddingTop: 25}}>
      {!token && AUTH_URL && (
        <WebView
          source={{
            uri: AUTH_URL,
          }}
          javaScriptEnabled
          startInLoadingState
          onNavigationStateChange={onNavigationStateChange}
        />
      )}
      {token && (
        <Text style={{marginHorizontal: 15, marginTop: 10}}>
          {'Access Token\n \n'}
          {token}
        </Text>
      )}
    </View>
  );
};
export default Login;
