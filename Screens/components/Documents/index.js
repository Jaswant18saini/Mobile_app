import React, {useEffect, useState} from 'react';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Image,
  NativeModules,
  ActivityIndicator,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {create} from 'apisauce';
import Header from './Header';
import {useNetInfo} from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';
import {ScrollView} from 'react-native';

const Documents = () => {
  const [parentFolder, setParentFolder] = useState();
  const [folderData, setFolderData] = useState();
  const [fileData, setFileData] = useState();
  const [loader, setLoader] = useState(false);
  const [currentFile, setCurrentFile] = useState([]);
  const netInfo = useNetInfo();

  const api = create({
    baseURL: 'http://34.231.129.177',
    headers: {Accept: 'application/json'},
  });

  function Allfolder() {
    api.get('/folder?projectId=a0f0r000000vIrEAAU').then(async res => {
      setParentFolder(res?.data?.tree?.children);
      await AsyncStorage.setItem(
        'AllFolders',
        JSON.stringify(res?.data?.tree?.children),
      );
    });
  }

  useEffect(() => {
    Allfolder();
  }, []);
  const checkNet = async () => {
    console.log('herererere123');
    const value = await AsyncStorage.getItem('AllFolders');
    console.log('itemmm', value);
    item = JSON.parse(value);

    setParentFolder(item);
  };

  useEffect(() => {
    if (netInfo.type !== 'unknown' && netInfo.isInternetReachable === false) {
      checkNet();
    } else {
      Allfolder();
    }
  }, [netInfo.type, netInfo.isInternetReachable]);
  var PSPDFKit = NativeModules.PSPDFKit;

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
            item = fileData; //JSON.parse(value);
          }
          const updatedData = item?.map((val, index) => {
            const filedatas = datafromstorage?.find(data =>
              data?.name.includes(val?.Id),
            );

            if (filedatas) {
              val['download'] = true;
            } else {
              val['download'] = false;
            }
            return val;
          });

          setFileData(updatedData);
        } catch (err) {
          console.log(err);
        }
      })
      .catch(err => {
        console.log(err.message, err.code);
      });
  };

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
            ? 'Document.pdf'
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
          ? 'Document.pdf'
          : `file://${RNFS.DocumentDirectoryPath}/${val?.Id}.pdf`;
      PSPDFKit.present(documentNew, {
        showThumbnailBar: 'scrollable',
        pageTransition: 'scrollContinuous',
        scrollDirection: 'vertical',
        documentLabelEnabled: true,
      });
    }
  };

  const handleDownload = val => {
    RNFS.downloadFile({
      fromUrl: val?.url,
      toFile: `${RNFS.DocumentDirectoryPath}/${val.Id}.pdf`,
    }).promise.then(r => {
      const updatedData = fileData?.map((valu, index) => {
        if (valu?.Id === val.Id) {
          valu['download'] = true;
        }
        return valu;
      });
      setFileData(updatedData);
    });
  };

  const handleParentFolder = async item => {
    setFolderData(item?.children);

    if (netInfo.type !== 'unknown' && netInfo.isInternetReachable === false) {
      // const value = await AsyncStorage.getItem('FoldersFiles');
      // console.log('itemmm', value);
      // item = JSON.parse(value);

      RNFS.readDir(RNFS.DocumentDirectoryPath)
        .then(async result => {
          let datafromstorage = result?.filter(val =>
            val.name.includes('.pdf'),
          );
          let item = [];
          try {
            const value = await AsyncStorage.getItem('FoldersFiles');
            item = JSON.parse(value);

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

            setFileData(updatedData);
          } catch (err) {
            console.log(err);
          }
        })
        .catch(err => {
          console.log(err.message, err.code);
        });

      setFileData(item);
    } else {
      api.get(`/folderfiles/${item?.value?.Id}`).then(async res => {
        // res?.data?.tree?.map(async item => {
        //   return (item.thumbnail = '');
        // });

        //setFileData(res?.data?.tree);

        RNFS.readDir(RNFS.DocumentDirectoryPath).then(async result => {
          let datafromstorage = result?.filter(val =>
            val.name.includes('.pdf'),
          );

          res?.data?.tree?.map(async items => {
            const filedatas = datafromstorage?.find(data =>
              data?.name.includes(val?.Id),
            );

            if (filedatas) {
              items['download'] = true;
            } else {
              items['download'] = false;
            }
            items.thumbnail = '';
            return items;
          });
          setFileData(res?.data?.tree);
        });

        await AsyncStorage.setItem(
          'FoldersFiles',
          JSON.stringify(res?.data?.tree),
        );
      });
    }
  };

  const Buttons = ({item}) => {
    console.log('item', item);
    return (
      <View
        key={item?.value?.Id}
        style={{
          padding: 10,
          width: '49%',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
        <Button
          title={item?.value?.Name}
          onPress={() => handleParentFolder(item)}
        />
      </View>
    );
  };

  const FolderView = ({item}) => {
    return (
      <ScrollView>
        <View style={styles.buttonDown}>
          <TouchableOpacity onPress={null}>
            <FontAwesomeIcon type="FontAwesome" name="folder" color="#000" />
          </TouchableOpacity>
          <Text>{item?.value?.Name}</Text>
          <TouchableOpacity onPress={null}>
            <FontAwesomeIcon type="FontAwesone" name="download" color="#000" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const FilesView = ({item}) => {
    const data = {
      image: require('../../../assets/thumbnailDemo.webp'),
    };
    return (
      <ScrollView>
        <View style={styles.Boxwrapper}>
          <Text style={[styles.textName, {fontWeight: '900', color: '#333'}]}>
            {item?.Name}
          </Text>
          <Image
            source={data?.image}
            style={[
              {
                width: 100,
                height: 100,
                marginLeft: 'auto',
                marginRight: 'auto',
                flexWrap: 'wrap',
                alignItems: 'center',
                flex: 1,
                justifyContent: 'center',
              },
            ]}
          />
          {currentFile.Id === item?.Id && loader && <ActivityIndicator />}
          {(netInfo.type !== 'unknown' &&
            netInfo.isInternetReachable === false) ||
          item?.download ? (
            <Ionicons
              onPress={() => handleDownload(item)}
              style={{textAlign: 'center', marginTop: 15, marginBottom: 10}}
              type="Ionicons"
              name="checkmark-done"
              color="#00bfff"
              size={20}
            />
          ) : (
            <FontAwesomeIcon
              onPress={() => handleDownload(item)}
              style={{textAlign: 'center', marginTop: 15, marginBottom: 10}}
              type="FontAwesone"
              name="download"
              color="#000"
            />
          )}

          <Button
            // disabled={!item?.download}
            title="View"
            onPress={() => handleView(item)}
          />
          <Button
            disabled={
              (netInfo.type !== 'unknown' &&
                netInfo.isInternetReachable === false) ||
              item?.download
            }
            title="Download"
            onPress={() => {
              handleDownload(item);
            }}
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <>
      <View>
        <Header />
        <View>
          <FlatList
            style={styles.button}
            data={parentFolder}
            renderItem={Buttons}
            numColumns={2}
            horizontal={false}
            keyExtractor={item => item.value.Id}
          />
        </View>
      </View>
      <View>
        <View>
          <Text style={{textAlign: 'center', marginBottom: 10}}>Folders</Text>
          <View style={styles.mainBx}>
            <FlatList
              data={folderData}
              numColumns={4}
              horizontal={false}
              renderItem={FolderView}
              keyExtractor={item => item.value.Id}
            />
          </View>
        </View>
        <View style={{width: '100%', paddingHorizontal: 10}}>
          <Text style={{textAlign: 'center', marginTop: 15, marginBottom: 10}}>
            Documents
          </Text>
          <FlatList
            data={fileData}
            numColumns={4}
            horizontal={false}
            renderItem={FilesView}
            keyExtractor={item => item.Id}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tinyLogo: {
    width: 50,
    height: 50,
    color: '#000',
  },
  title: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#20232a',
    display: 'flex',
    borderRadius: 6,
    backgroundColor: '#61dafb',
    color: '#20232a',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
  },
  mainBx: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  buttonDown: {
    backgroundColor: '#f7f7f7',
    marginLeft: 0,
    padding: 10,
    flexBasis: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginHorizontal: 20,
    margin: 4,
  },
  Boxwrapper: {
    flexDirection: 'column',
    borderWidth: 1,
    padding: 10,
    borderColor: '#ccc',
    borderStyle: 'solid',
    gap: '5px',
    flex: 1,
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    margin: 10,
  },
  textName: {
    textAlign: 'center',
  },
});
export default Documents;
