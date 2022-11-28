import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Linking,
  Image,
  TextStyle,
  ViewStyle,
  TouchableHighlight,
} from 'react-native';
import {Header as HeaderRNE, HeaderProps, Icon} from '@rneui/themed';
import {create} from 'apisauce';
import {TouchableOpacity} from 'react-native-gesture-handler';

const Header = props => {
  const docsNavigate = () => {
    Linking.openURL(`https://reactnativeelements.com/docs/${props.view}`);
    console.log('On login click');
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
            <Icon type="EvilIcons" name="search" color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={playgroundNavigate}>
            <Icon type="MaterialIcons" name="more-horiz" color="#fff" />
          </TouchableOpacity>
        </View>
      }
      centerComponent={
        <>
          <View style={styles.mainWrapper}>
            <View>
              <Text style={styles.titleText}>Documents</Text>
            </View>
            <View>
              <Text style={styles.titleText}>Training Project</Text>
            </View>
          </View>
        </>
      }
    />
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    color: '#fff',
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    background: '#fff',
    marginBottom: 20,
    width: '100%',
    paddingVertical: 15,
  },
  heading: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
  },
  subheaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 10,
  },
});

export default Header;
