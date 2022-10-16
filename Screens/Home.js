import React, {Component, useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Platform,
  Button,
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeModules,
} from 'react-native';
import {create} from 'apisauce';
import {useNetInfo} from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';

const Home = () => {
  const netInfo = useNetInfo();

  const api = create({
    baseURL: 'https://e177-180-188-224-155.in.ngrok.io',
    headers: {Accept: 'application/json'},
  });

  const [folder, setFolder] = useState([]);

  const ref1 = useRef();
  var PSPDFKit = NativeModules.PSPDFKit;

  const handlePress = id => {};
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
        await AsyncStorage.setItem('FolderInfo', JSON.stringify(data));
      });
  }

  const get = async key => {
    RNFS.readDir(RNFS.DocumentDirectoryPath)
      .then(async result => {
        console.log('GOT RESULT', result);
        let datafromstorage = result?.filter(val => val.name.includes('.pdf'));
        try {
          const value = await AsyncStorage.getItem('FolderInfo');
          const item = JSON.parse(value);
          const updatedData = item?.map((val, index) => {
            const filedata = datafromstorage?.find(data =>
              data?.name.includes(val?.Id),
            );
            console.log('filedata', filedata);
            if (filedata) {
              val['download'] = true;
            } else {
              val['download'] = false;
            }
            return val;
          });
          console.log('updatedData', updatedData);
          setFolder(updatedData);
        } catch (err) {
          console.log(err);
        }
        console.log('data', data);
      })
      .catch(err => {
        console.log(err.message, err.code);
      });
  };
  const handleView = val => {
    console.log('great!!!');
    const documentNew =
      Platform.OS === 'ios'
        ? 'Document.pdf'
        : `file://${RNFS.DocumentDirectoryPath}/${val?.Id}.pdf`;
    PSPDFKit.present(documentNew, {
      showThumbnailBar: 'scrollable',
      pageTransition: 'scrollContinuous',
      scrollDirection: 'vertical',
      documentLabelEnabled: true,
    });
  };
  const handleDownload = val => {
    RNFS.downloadFile({
      fromUrl: val?.url,
      toFile: `${RNFS.DocumentDirectoryPath}/${val.Id}.pdf`,
    }).promise.then(r => {
      console.log('working', RNFS.DocumentDirectoryPath);
    });
  };
  console.log('folder', folder);

  return (
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
                <Button
                  disabled={!person?.download}
                  title="View"
                  onPress={() => handleView(person)}
                />
                <Button
                  disabled={
                    netInfo.type !== 'unknown' &&
                    netInfo.isInternetReachable === false
                  }
                  title="Download"
                  onPress={() => {
                    handleDownload(person);
                  }}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
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
