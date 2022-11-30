import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';

const Checklists = () => {
  return (
    <WebView
      source={{
        uri: 'https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id=3MVG9wt4IL4O5wvKO2JUZnYYNyI7XJuNh_ZPFmHs1gHytxLtJq3t.tqpfDC8_rlXh50Xngz0R9xBR_HhMZwat&redirect_uri=https://presonal-dev-ed.my.salesforce.com/services/authcallback/demo&state=mystate',
      }}
    />
  );
};
export default Checklists;
