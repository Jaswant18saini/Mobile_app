import React, {Component, useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Platform,
  Button,
  View,
  Text,
  LogBox,
  ScrollView,
  StyleSheet,
  Alert,
  Pressable,
  Modal,
  NativeModules,
} from 'react-native';
import {create} from 'apisauce';
import {useNetInfo} from '@react-native-community/netinfo';

const DOCUMENT =
  Platform.OS === 'ios' ? 'Document.pdf' : 'file:///android_asset/Document.pdf';
const Home = () => {
  const netInfo = useNetInfo();

  const api = create({
    baseURL: 'https://00e3-180-188-224-155.in.ngrok.io',
    headers: {Accept: 'application/json'},
  });

  const [folder, setFolder] = useState([]);

  const ref1 = useRef();
  var PSPDFKit = NativeModules.PSPDFKit;

  const handlePress = id => {
    PSPDFKit.present(DOCUMENT, {
      showThumbnailBar: 'scrollable',
      pageTransition: 'scrollContinuous',
      scrollDirection: 'vertical',
      documentLabelEnabled: true,
    });
  };
  useEffect(() => {
    if (netInfo.type !== 'unknown' && netInfo.isInternetReachable === false) {
      get();
    } else {
      callApi();
    }
  }, [netInfo.type]);

  function callApi() {
    api
      .get('/folderfiles/a0B0r00001AXOqkEAH')
      .then(response => response?.data.tree)
      .then(async data => {
        setFolder(data);
        await AsyncStorage.setItem('Demo', JSON.stringify(data));
      });
  }

  const get = async key => {
    try {
      const value = await AsyncStorage.getItem('Demo');
      const item = JSON.parse(value);
      setFolder(item);
      console.log('item', item);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <View>
        <ScrollView>
          <View>
            {folder?.map(person => {
              return (
                <View key={person.Id}>
                  <Text
                    onPress={() => handlePress(person.Id)}
                    style={styles.item}>
                    {person.File_Name__c}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </>
  );
};
export default Home;

const styles = StyleSheet.create({
  container: {
    padding: 50,
    flex: 1,
  },
  item: {
    padding: 20,
    fontSize: 15,
    marginTop: 5,
  },
});
