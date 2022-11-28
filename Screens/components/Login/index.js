import React from 'react';
import {Button, Image, TouchableHighlight} from 'react-native';
import {View} from 'react-native';

const Login = () => {
  const onLoginClick = () => {
    console.log('On login click');
  };
  const data = {
    image: require('../../../assets/Salesforce_logo.png'),
  };
  return (
    <View>
      <Button title="Login with" onPress={() => onLoginClick()} />
      <TouchableHighlight onPress={() => onLoginClick()}>
        <Image
          source={data?.image}
          style={[
            {
              width: '100%',
              height: 150,
              // marginLeft: 'auto',
              // marginRight: 'auto',
              // flexWrap: 'wrap',
              // alignItems: 'center',
              // flex: 1,
              // color: '#fff',
              // justifyContent: 'center',
            },
          ]}
        />
      </TouchableHighlight>
    </View>
  );
};
export default Login;
