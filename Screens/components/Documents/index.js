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
  TouchableHighlight,
  TouchableWithoutFeedback,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {create} from 'apisauce';
import Header from './Header';
import {useNetInfo} from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';
import {ScrollView} from 'react-native';

const Documents = ({navigation, ...props}) => {
  const [parentFolder, setParentFolder] = useState();
  const [folderData, setFolderData] = useState();
  const [fileData, setFileData] = useState();
  const [loader, setLoader] = useState(false);
  const [currentFile, setCurrentFile] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaderForDownload, setLoaderForDownload] = useState(false);
  const [selectedfolder, setSelectedFolder] = useState(null);

  const [selectedProjectId, setSelectedProjectId] = useState('');
  //a0f0r000000vIrEAAU
  const [projectOptions, setProjectOptions] = useState([]);

  const api = create({
    baseURL: 'http://34.231.129.177',
    headers: {Accept: 'application/json'},
  });
  const GetToken = async () => {
    return await api
      .get('/get_accesss_token')
      .then(res => {
        if (res?.status === 200) {
          return res;
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  async function current_folder_options(loginInfo) {
    const LoginInfo = JSON.parse(loginInfo);
    await api
      .get(
        `/get_all_project?token=${LoginInfo.access_token}&instanceUrl=${LoginInfo.instance_url}`,
      )
      .then(res => {
        if (res?.status === 200) {
          let ProjectOptions = [];
          res?.data?.records?.map(val => {
            ProjectOptions.push({
              value: val?.Id,
              label: val?.Name,
            });
          });
          setProjectOptions(ProjectOptions);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  const netInfo = useNetInfo();

  function Allfolder() {
    setLoading(true);
    api
      .get(`/folder?projectId=${selectedProjectId}`)
      .then(async res => {
        setLoading(false);
        setParentFolder(res?.data?.tree?.children);
        await AsyncStorage.setItem(
          'AllFolders',
          JSON.stringify(res?.data?.tree?.children),
        );
      })
      .catch(err => {
        setLoading(false);
      });
  }
  const getLoginInfo = async () => {
    const loginInfo = await AsyncStorage.getItem('loginInfo');
    return loginInfo;
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getLoginInfo().then(res => {
        current_folder_options(res);
        Allfolder();
      });
    });
    return unsubscribe;
  }, [props]);

  useEffect(() => {
    Allfolder();
  }, [selectedProjectId]);

  const checkNet = async () => {
    const value = await AsyncStorage.getItem('AllFolders');
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

  const handleDownload = val => {
    setCurrentFile(val);
    setLoaderForDownload(true);
    RNFS.downloadFile({
      fromUrl: val?.url,
      toFile: `${RNFS.DocumentDirectoryPath}/${val.Id}_pspdf.pdf`,
    })
      .promise.then(r => {
        const updatedData = fileData?.map((valu, index) => {
          if (valu?.Id === val.Id) {
            valu['download'] = true;
          }
          return valu;
        });
        setLoaderForDownload(false);
        setFileData(updatedData);
      })
      .catch(err => {});
  };

  const handleParentFolder = async item => {
    setSelectedFolder(null);
    setFileData([]);
    setFolderData(item?.children);
    if (netInfo.type !== 'unknown' && netInfo.isInternetReachable === false) {
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
    } else {
      api
        .get(`/folderfiles/${item?.value?.Id}`)
        .then(async res => {
          RNFS.readDir(RNFS.DocumentDirectoryPath).then(async result => {
            let datafromstorage = result?.filter(val =>
              val.name.includes('.pdf'),
            );

            let updated_data = await res?.data?.tree?.map(async items => {
              const filedatas = datafromstorage?.find(data =>
                data?.name.includes(items?.Id),
              );

              if (filedatas) {
                items['download'] = true;
              } else {
                items['download'] = false;
              }
              items.thumbnail = '';
              return items;
            });

            Promise.all(updated_data).then(function (results) {
              setFileData(results);
            });
          });

          await AsyncStorage.setItem(
            'FoldersFiles',
            JSON.stringify(res?.data?.tree),
          );
        })
        .catch(err => {});
    }
  };

  const handleFolderClick = async item => {
    setSelectedFolder(item?.value?.Name);
    setFileData([]);
    setFolderData(item?.children);
    if (netInfo.type !== 'unknown' && netInfo.isInternetReachable === false) {
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
    } else {
      api
        .get(`/folderfiles/${item?.value?.Id}`)
        .then(async res => {
          RNFS.readDir(RNFS.DocumentDirectoryPath).then(async result => {
            let datafromstorage = result?.filter(val =>
              val.name.includes('.pdf'),
            );

            let updated_data = await res?.data?.tree?.map(async items => {
              const filedatas = datafromstorage?.find(data =>
                data?.name.includes(items?.Id),
              );

              if (filedatas) {
                items['download'] = true;
              } else {
                items['download'] = false;
              }
              items.thumbnail = '';
              return items;
            });

            Promise.all(updated_data).then(function (results) {
              setFileData(results);
            });
          });

          await AsyncStorage.setItem(
            'FoldersFiles',
            JSON.stringify(res?.data?.tree),
          );
        })
        .catch(err => {});
    }
  };

  const Buttons = ({item}) => {
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
      <ScrollView style={styles.scrollView}>
        <TouchableWithoutFeedback
          disabled={
            netInfo.type !== 'unknown' && netInfo.isInternetReachable === false
          }
          onPress={() => handleFolderClick(item)}>
          <View style={styles.buttonDown}>
            <TouchableOpacity>
              <FontAwesomeIcon type="FontAwesome" name="folder" color="#000" />
            </TouchableOpacity>
            <Text>{item?.value?.Name}</Text>
            <TouchableOpacity onPress={null}>
              <FontAwesomeIcon
                type="FontAwesone"
                name="download"
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    );
  };
  const SelectedFolder = () => {
    return (
      <TouchableWithoutFeedback>
        <View style={styles.buttonDown}>
          <TouchableOpacity>
            <FontAwesomeIcon type="FontAwesome" name="folder" color="#000" />
          </TouchableOpacity>
          <Text>{selectedfolder}</Text>
          <TouchableOpacity onPress={null}>
            <FontAwesomeIcon type="FontAwesone" name="download" color="#000" />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const FilesView = ({item}) => {
    const data = {
      image: require('../../../assets/thumbnailDemo2.jpg'),
    };
    return (
      <ScrollView>
        <View style={styles.Boxwrapper}>
          <Text style={[styles.textName, {fontWeight: '900', color: '#333'}]}>
            {item?.Name}
          </Text>
          <TouchableHighlight
            disabled={
              netInfo.type !== 'unknown' &&
              netInfo.isInternetReachable === false &&
              !item?.download
            }
            onPress={() => handleView(item)}>
            <Image
              source={data?.image}
              style={[
                {
                  width: '100%',
                  height: 150,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  flex: 1,
                  justifyContent: 'center',
                },
              ]}
            />
          </TouchableHighlight>

          {currentFile.Id === item?.Id && loader && <ActivityIndicator />}
          {item?.download ? (
            <Ionicons
              onPress={() => handleView(item)}
              style={{textAlign: 'center', marginTop: 15, marginBottom: 10}}
              type="Ionicons"
              name="checkmark-done"
              color="#00bfff"
              size={25}
            />
          ) : currentFile.Id === item?.Id && loaderForDownload ? (
            <ActivityIndicator />
          ) : (
            <FontAwesomeIcon
              disabled={
                netInfo.type !== 'unknown' &&
                netInfo.isInternetReachable === false &&
                !item?.download
              }
              onPress={() => handleDownload(item)}
              style={{textAlign: 'center', marginTop: 15, marginBottom: 10}}
              type="FontAwesone"
              name="download"
              color="#000"
              size={25}
            />
          )}

          {/* <Button
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
          /> */}
          {/* netInfo.type !== 'unknown' &&
          netInfo.isInternetReachable === false && */}
        </View>
      </ScrollView>
    );
  };

  return (
    <>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View>
            <Header
              dropdownData={projectOptions}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
            />
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
          <ScrollView>
            <View>
              <View>
                {selectedfolder ? <SelectedFolder /> : ''}
                <Text style={{textAlign: 'center', marginBottom: 10}}>
                  Folders
                </Text>
                <View style={styles.mainBx}>
                  {fileData?.length === 0 ? (
                    <ActivityIndicator />
                  ) : (
                    <FlatList
                      data={folderData}
                      numColumns={3}
                      horizontal={false}
                      renderItem={({item}) => <FolderView item={item} />}
                      ItemSeparatorComponent={() => (
                        <View style={{height: 10}} />
                      )}
                      keyExtractor={item => item.value.Id}
                    />
                  )}
                </View>
              </View>
              <View style={{width: '100%', paddingHorizontal: 10}}>
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 15,
                    marginBottom: 10,
                  }}>
                  Documents
                </Text>

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
            </View>
          </ScrollView>
        </>
      )}
    </>
  );
};

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e7ecf0',
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
    backgroundColor: '#e7ecf0',
  },
  buttonDown: {
    backgroundColor: 'white',
    padding: 15,
    flexBasis: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    width: '100%',
    color: '#000',
  },
  Boxwrapper: {
    flexDirection: 'column',
    borderWidth: 1,
    padding: 10,
    borderColor: '#ccc',
    borderStyle: 'solid',
    gap: '15px',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    margin: 10,
    backgroundColor: 'white',
    textAlign: 'left',
  },
  textName: {
    textAlign: 'center',
  },
});
export default Documents;
