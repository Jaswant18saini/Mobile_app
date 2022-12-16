import React, {useEffect, useRef, useState} from 'react';
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

const Home = ({navigation}) => {
  const netInfo = useNetInfo();

  const api = create({
    baseURL: 'http://34.231.129.177',
    headers: {Accept: 'application/json'},
  });

  const [folder, setFolder] = useState([]);

  const ref1 = useRef();
  var PSPDFKit = NativeModules.PSPDFKit;
  const DOCUMENT =
	Platform.OS === 'ios'
		? 'Document.pdf'
		: 'file:///android_asset/Document.pdf';

  const handlePress = id => {};
  useEffect(() => {
    if (netInfo.type !== 'unknown' && netInfo.isInternetReachable === false) {
      get();
    } else {
      callApi();
    }
  }, [netInfo.type, netInfo.isInternetReachable]);

  function callApi() {
    api
      .get('/folderfiles/a0B0r00001AXOqkEAH')
      .then(response => response?.data.tree)
      .then(async res => {
        get(res);
        // setFolder(data);
        await AsyncStorage.setItem('FolderInfo', JSON.stringify(res));
      });
  }

  const get = async (data = null) => {
    RNFS.readDir(RNFS.DocumentDirectoryPath)
      .then(async result => {
        let datafromstorage = result?.filter(val => val.name.includes('.pdf'));
        let item = [];
        try {
          if (data) {
            item = data;
          } else {
            const value = await AsyncStorage.getItem('FolderInfo');
            item = JSON.parse(value);
          }
          const updatedData = item?.map((val, index) => {
            const filedata = datafromstorage?.find(data =>
              data?.name.includes(val?.Id),
            );

            if (filedata) {
              val['download'] = true;
            } else {
              val['download'] = false;
            }
            return val;
          });

          setFolder(updatedData);
        } catch (err) {
          console.log(err);
        }
      })
      .catch(err => {
        console.log(err.message, err.code);
      });
  };
  const handleView = val => {
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
                    (netInfo.type !== 'unknown' &&
                      netInfo.isInternetReachable === false) ||
                    person?.download
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
