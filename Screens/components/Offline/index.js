import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  Image,
  NativeModules,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {View} from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {compact} from 'lodash';
import {styles} from '../Documents';
import {useNetInfo} from '@react-native-community/netinfo';
import {useRoute} from '@react-navigation/native';

const Offline = ({navigation}) => {
  const [fileData, setFileData] = useState([]);
  const [currentFile, setCurrentFile] = useState([]);
  const [loader, setLoader] = useState(false);
  const netInfo = useNetInfo();
  const route = useRoute();

  console.log(route, 'routessssssssssssssssssssssssssssss');
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      _downloadedFiles();
    });
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, []);
  console.log('fileData', fileData);
  var PSPDFKit = NativeModules.PSPDFKit;

  function _downloadedFiles() {
    // if (netInfo.type !== 'unknown' && netInfo.isInternetReachable === false) {
    RNFS.readDir(RNFS.DocumentDirectoryPath)
      .then(async result => {
        let datafromstorage = result?.filter(val => val.name.includes('.pdf'));
        let item = [];
        try {
          const value = await AsyncStorage.getItem('FoldersFiles');
          item = JSON.parse(value);
          // console.log(datafromstorage)
          const updatedData = item?.map((val, index) => {
            const filedata = datafromstorage?.find(data =>
              data?.name.includes(val?.Id),
            );
            if (fileData) val['download'] = true;
            return filedata ? val : null;
          });

          setFileData(compact(updatedData));
        } catch (err) {
          console.log(err);
        }
      })
      .catch(err => {
        console.log(err.message, err.code);
      });

    // setFileData(item);
    // }
  }

  const handleView = val => {
    setCurrentFile(val);
    if (!val?.download && netInfo.isInternetReachable === true) {
      setLoader(true);
      const result = Math.random().toString(36).substring(2, 7);
      RNFS.downloadFile({
        fromUrl: val?.url,
        toFile: `${RNFS.DocumentDirectoryPath}/${result}.pdf`,
      }).promise.then(r => {
        const documentNew =
          Platform.OS === 'ios'
            ? `${RNFS.DocumentDirectoryPath}/${result}.pdf`
            : `file://${RNFS.DocumentDirectoryPath}/${result}.pdf`;
        setLoader(false);
        PSPDFKit.present(documentNew, {
          showThumbnailBar: 'scrollable',
          pageTransition: 'scrollContinuous',
          scrollDirection: 'vertical',
          documentLabelEnabled: true,
        });
      });
    } else {
      const documentNew =
        Platform.OS === 'ios'
          ? `${RNFS.DocumentDirectoryPath}/${val?.id}.pdf`
          : `file://${RNFS.DocumentDirectoryPath}/${val?.Id}.pdf`;
      PSPDFKit.present(documentNew, {
        showThumbnailBar: 'scrollable',
        pageTransition: 'scrollContinuous',
        scrollDirection: 'vertical',
        documentLabelEnabled: true,
      });
    }
  };

  const FilesView = ({item}) => {
    const data = {
      image: require('../../../assets/thumbnailDemo2.jpg'),
    };
    return (
      <ScrollView>
        <TouchableWithoutFeedback
          disabled={
            netInfo.type !== 'unknown' &&
            netInfo.isInternetReachable === false &&
            !item?.download
          }
          onPress={() => handleView(item)}>
          <View style={styles.Boxwrapper}>
            <TouchableOpacity>
              <FontAwesomeIcon type="FontAwesome" name="file" color="#000" />
            </TouchableOpacity>
            <Text style={[styles.textName, {fontWeight: '900', color: '#333'}]}>
              {item?.Name}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        {currentFile.Id === item?.Id && loader && <ActivityIndicator />}
      </ScrollView>
    );
  };

  return (
    <View style={{width: '100%', paddingHorizontal: 10}}>
      {fileData?.length === 0 ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={fileData}
          numColumns={4}
          horizontal={false}
          renderItem={FilesView}
          keyExtractor={item => item.Id}
        />
      )}
    </View>
  );
};
export default Offline;