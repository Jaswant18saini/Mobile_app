import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Linking,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {Header as HeaderRNE, HeaderProps, Icon} from '@rneui/themed';
import {create} from 'apisauce';
import {TouchableOpacity} from 'react-native-gesture-handler';

const Header = props => {
  const docsNavigate = () => {
    Linking.openURL(`https://reactnativeelements.com/docs/${props.view}`);
  };

  const playgroundNavigate = () => {
    Linking.openURL(`https://@rneui/themed.js.org/#/${props.view}`);
  };

  return (
    <HeaderRNE
      leftComponent={{
        icon: 'menu',
        color: '#fff',
      }}
      rightComponent={
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={docsNavigate}>
            <Icon type="EvilIcons" name="search" color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{marginLeft: 10}}
            onPress={playgroundNavigate}>
            <Icon type="MaterialIcons" name="more-horiz" color="black" />
          </TouchableOpacity>
        </View>
      }
      centerComponent={
        <>
          <View style={styles.headerRight}>
            <View>
              <Text>Documents</Text>
            </View>
            <View>
              <Text>Training Project</Text>
            </View>
          </View>
        </>
      }
    />
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#397af8',
    marginBottom: 20,
    width: '100%',
    paddingVertical: 15,
  },
  heading: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 5,
  },
  subheaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Header;
