import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Text,
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  NativeModules,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {compact} from 'lodash';
import {useNetInfo} from '@react-native-community/netinfo';
import {useRoute} from '@react-navigation/native';
import {PdfThumbnailImage} from '../../common/PdfThumbnailImage';

const Offline = ({navigation}) => {
  const [fileData, setFileData] = useState([]);
  const [currentFile, setCurrentFile] = useState([]);
  const [loader, setLoader] = useState(false);
  const netInfo = useNetInfo();
  const route = useRoute();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      _downloadedFiles();
    });
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, []);
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
  }

  const handleView = val => {
    setCurrentFile(val);
    const documentNew =
      Platform.OS === 'ios'
        ? `${RNFS.DocumentDirectoryPath}/${val?.id}.pdf`
        : `file://${RNFS.DocumentDirectoryPath}/${val?.Id}_pspdf.pdf`;
    PSPDFKit.present(documentNew, {
      showThumbnailBar: 'scrollable',
      pageTransition: 'scrollContinuous',
      scrollDirection: 'vertical',
      documentLabelEnabled: true,
    });
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
            <TouchableOpacity style={{flex: 0.3, marginRight: 15}}>
              <PdfThumbnailImage
                item={item}
                handleView={() => handleView(item)}
              />
            </TouchableOpacity>
            <View style={styles.InnerBox}>
              <Text style={[styles.textName]} numberOfLines={1}>
                {item?.Name}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <Text
                  style={{
                    paddingVertical: 2,
                    paddingHorizontal: 3,
                    backgroundColor: '#ccc',
                    color: '#fff',
                    marginRight: 5,
                  }}>
                  V1
                </Text>
                <Text
                  style={{fontWeight: '400', color: '#333', textAlign: 'left'}}>
                  {item?.Name}
                </Text>
              </View>
            </View>
            <AntDesignIcon
              style={{
                width: 30,
                flex: 0.3,
                alignSelf: 'flex-end',
                textAlign: 'right',
                padding: 5,
              }}
              type="AntDesign"
              name="ellipsis1"
              color="#808080"
              size={40}
            />
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
          numColumns={1}
          horizontal={false}
          renderItem={FilesView}
          keyExtractor={item => item.Id}
        />
      )}
    </View>
  );
};

export const styles = StyleSheet.create({
  InnerBox: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flex: 2,
    width: 100,
    textAlign: 'left',
  },
  Boxwrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    padding: 10,
    borderColor: '#f7f7f7',
    borderStyle: 'solid',
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
    marginHorizontal: 5,
    marginVertical: 5,
    backgroundColor: '#fff',
  },
  textName: {
    fontWeight: '500',
    color: '#333',
    textAlign: 'left',
  },
});
export default Offline;
