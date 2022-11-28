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
    <>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Button title="Login with" onPress={() => onLoginClick()} />
      </View>
      <View>
        <TouchableHighlight onPress={() => onLoginClick()}>
          <Image
            source={data?.image}
            style={[
              {
                width: '100%',
                height: 150,
              },
            ]}
          />
        </TouchableHighlight>
      </View>
    </>
  );
};
export default Login;
