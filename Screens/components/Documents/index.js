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
  BackHandler,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {create} from 'apisauce';
import Header from './Header';
import {useNetInfo} from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';
import {ScrollView} from 'react-native';
import _ from 'lodash';
import PSPDFKitView from 'react-native-pspdfkit';
import {cloneDeep} from 'lodash';
import {horizontalScale, moderateScale, verticalScale} from '../../Metrics';
import DeviceInfo from 'react-native-device-info';
import {ShowThumbnail} from '../../common/ShowThumbnail';

const Documents = ({navigation, ...props}) => {
  const [parentFolder, setParentFolder] = useState();
  const [folderData, setFolderData] = useState();
  const [currentFolderId, setCurrentFolderId] = useState([]);
  const [folderDownloadLoader, setFolderDownloadLoader] = useState(false);
  const [fileData, setFileData] = useState();
  const [loader, setLoader] = useState(false);
  const [currentFile, setCurrentFile] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaderForDownload, setLoaderForDownload] = useState(false);
  const [selectedfolder, setSelectedFolder] = useState(null);
  const [storeMarkup, setStoreMarkup] = useState();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [publicPrivate, setPublicPrivate] = useState('private');
  const [previous, setPrevious] = useState([]);
  const [userName, setUserName] = useState();
  const [userId1, setUserId1] = useState();
  //a0f0r000000vIrEAAU
  const [projectOptions, setProjectOptions] = useState([]);
  const [userId, setUserId] = useState([]);
  const [fileToLoad, setFileToLoad] = useState(null);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [markupAccess, setMarkupAccess] = useState(false);

  const docViewerRef = React.createRef(null);

  console.log('horizontalScale', currentFile?.id);
  console.log('folderData', fileData);

  const isTablet = DeviceInfo.isTablet();
  console.log(isTablet);

  const api = create({
    baseURL: 'http://34.231.129.177',
    headers: {Accept: 'application/json'},
  });
  console.log('projectOptions', projectOptions);
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
    // const LoginInfo1 = JSON.parse(userId);
    console.log('LoginInfo>llllllllllllllllllllll', LoginInfo);
    await api
      .get(
        `/get_all_project?token=${LoginInfo.access_token}&instanceUrl=${LoginInfo.instance_url}`,
      )
      .then(res => {
        console.log('ccccc', res);
        if (res?.status === 200) {
          let ProjectOptions = [];

          res?.data?.records?.map(val => {
            ProjectOptions.push({
              value: val?.Id,
              label: val?.Name,
            });
          });
          setProjectOptions(ProjectOptions);
          api
            .get(
              `/get_current_user2?token=${LoginInfo.access_token}&instanceUrl=${LoginInfo.instance_url}`,
            )
            .then(res => {
              setUserName(res?.data?.username);
              setUserId1(res?.data?.userId);
              console.log('pageCount::>', pageCount);
            });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  const netInfo = useNetInfo();

  function Allfolder() {
    console.log('newwwwwwwwww', selectedProjectId);
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
    console.log('loginInfo', loginInfo);
    const loginInfo = await AsyncStorage.getItem('loginInfo');
    return loginInfo;
  };
  useEffect(() => {
    console.log('documents', props);

    const unsubscribe = navigation.addListener('focus', () => {
      getLoginInfo().then(res => {
        setUserId(res);
        current_folder_options(res);
        Allfolder();
      });
    });
    return unsubscribe;
  }, [props]);

  useEffect(() => {
    Allfolder();
  }, [selectedProjectId]);

  const handleClosePdf = () => {
    setShowAnnotations(false);
    setMarkupAccess(false);
    setFileToLoad(null);
  };

  const checkNet = async () => {
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
    let pdfMarkup;
    if (val?.Instant_Json__c) {
      let annotationList = JSON.parse(val.Instant_Json__c).annotations;
      console.log('checking annotation values::>>', annotationList);
      pdfMarkup = {
        format: 'https://pspdfkit.com/instant-json/v1',
        annotations: annotationList,
      };
    }
    setCurrentFile(val);

    if (!val?.download && netInfo.isInternetReachable === true) {
      setLoader(true);
      const result = Math.random().toString(36).substring(2, 7);
      console.log('result is ', result);
      RNFS.downloadFile({
        fromUrl: val?.url,
        toFile: `${RNFS.DocumentDirectoryPath}/${result}.pdf`,
      }).promise.then(r => {
        const documentNew =
          Platform.OS === 'ios'
            ? `${RNFS.DocumentDirectoryPath}/${result}.pdf`
            : `file://${RNFS.DocumentDirectoryPath}/${result}.pdf`;
        setLoader(false);

        // view controlled
        setFileToLoad(documentNew);
      });
    } else {
      console.log('Test');
      //_pspdf is required in ios
      const documentNew =
        Platform.OS === 'ios'
          ? `${RNFS.DocumentDirectoryPath}/${val?.File_Name__c}.pdf`
          : `file://${RNFS.DocumentDirectoryPath}/${val?.File_Name__c}.pdf`;
      setFileToLoad(documentNew);
      // PSPDFKit.present(documentNew, {
      //   showThumbnailBar: 'scrollable',
      //   pageTransition: 'scrollContinuous',
      //   scrollDirection: 'vertical',
      //   documentLabelEnabled: true,
      // })
      //   .then(success => {
      //     if (success) {
      //       console.log('sucees annotiation');
      //       // And finally, present the newly processed document with embedded annotations.
      //       PSPDFKit.addAnnotations(pdfMarkup);
      //     } else {
      //       // alert('Failed to embed annotations.');
      //       console.log('Failed to embed annotations.');
      //     }
      //   })
      //   .catch(error => {
      //     // alert(JSON.stringify(error));
      //     console.log('Failed to embed annotations.', error);
      //   });
      /*PSPDFKit.addAnnotations(pdfMarkup).then(success => {
            if (success) {
              console.log("sucees annotiation");
              // And finally, present the newly processed document with embedded annotations.
              PSPDFKit.present(documentNew, {
                showThumbnailBar: 'scrollable',
                pageTransition: 'scrollContinuous',
                scrollDirection: 'vertical',
                documentLabelEnabled: true,
      
                
              })
            } else {
              alert('Failed to embed annotations.');
            }
          })
          .catch(error => {
            alert(JSON.stringify(error));
          });*/
    }
  };

  const handleDownload = val => {
    setCurrentFile(val);
    setLoaderForDownload(true);
    RNFS.downloadFile({
      fromUrl: val?.url,
      toFile: `${RNFS.DocumentDirectoryPath}/${val.File_Name__c}.pdf`,
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

  const handleDownloadFolder = (val, folder_name) => {
    RNFS.downloadFile({
      fromUrl: val?.url,
      toFile: `${RNFS.DocumentDirectoryPath}/${val.Id}_folder_name_${folder_name}.pdf`,
    })
      .promise.then(r => {
        const updatedData = fileData?.map((valu, index) => {
          if (valu?.Id === val.Id) {
            valu['download'] = true;
          }
          return valu;
        });

        setFolderDownloadLoader(false);
      })
      .catch(err => {});
  };

  const handleParentFolder = async item => {
    setSelectedFolder(null);
    setFileData([]);
    RNFS.readDir(RNFS.DocumentDirectoryPath).then(async result => {
      let datafromstorage = result?.filter(val =>
        val.name.includes('_folder_name_'),
      );

      const newData = item?.children?.map((dataItem, index) => {
        let dataStorage = datafromstorage?.filter(val =>
          val.name.includes(dataItem?.value?.Name),
        );

        if (dataStorage?.length > 0) {
          dataItem['download'] = true;
        } else {
          dataItem['download'] = false;
        }
        return dataItem;
        // datafromstorage?.map((data, index) => {});
      });
      setFolderData(newData);
    });

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
                data?.name.includes(val?.Name),
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
                data?.name.includes(items?.Name),
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

  /**
   * obj struct
   * {docId: [annotationsObj1, annotationsObj2]}
   */
  const handleSaveOfflineAnnotations = async (docId, annotationsObj) => {
    const savedData = await AsyncStorage.getItem('OfflineAnnotations');
    if (savedData) {
      const savedDataJson = JSON.parse(savedData);
      if (savedDataJson[docId] && savedDataJson[docId].length > 0) {
        savedDataJson[docId].push(JSON.stringify(annotationsObj));
      } else {
        savedDataJson[docId] = [JSON.stringify(annotationsObj)];
      }

      try {
        await AsyncStorage.setItem(
          'OfflineAnnotations',
          JSON.stringify(savedDataJson),
        );
      } catch (error) {
        console.log('Offline Save annotations error: ', error);
      }
    } else {
      try {
        await AsyncStorage.setItem(
          'OfflineAnnotations',
          JSON.stringify({
            [docId]: [JSON.stringify(annotationsObj)],
          }),
        );
      } catch (e) {
        // save error
        console.log('Offline Save annotations error: ', e);
      }
    }
  };

  const handlePublic = () => {
    if (markupAccess) {
      setPublicPrivate('private');
      setMarkupAccess(false);
      return 'private';
    } else {
      setMarkupAccess(true);
      setPublicPrivate('public');
      return 'public';
    }
  };

  const handleSaveAnnotations = () => {
    for (let p = 0; p < pageCount; p++) {
      docViewerRef.current
        .getAllUnsavedAnnotations()
        .then(result => {
          if (result) {
            console.log('data json for markup', JSON.stringify(result));

            for (let e = 0; e < result.annotations.length; e++) {
              if (result.annotations[e].customData == undefined) {
                let customData = {
                  userId: userId1,
                  userFullName: userName,
                  source: 'save_annotation',
                  access: publicPrivate,
                };
                console.log('customData ::', customData);
                result.annotations[e]['customData'] = customData;
                //const resultData = result.get().set("customData", customData)
                console.log('Size  :: ' + result.annotations.length);
                console.log('json for markup', JSON.stringify(result));
              }
            }
            if (netInfo.isInternetReachable) {
              // save api call.
              //  console.log('current selected file ', currentFile);
              // console.log("json for markup",JSON.stringify(result));

              api
                .put(`/markup/${currentFile.Id}`, result)
                .then(success => {
                  console.log('success add annotations:: ', success);
                  alert('Annotations Saved');
                  const fileDataTmp = cloneDeep(currentFile);
                  if (fileDataTmp?.Instant_Json__c) {
                    const annotationsObj = JSON.parse(
                      fileDataTmp.Instant_Json__c,
                    );
                    if (annotationsObj.annotations) {
                      annotationsObj.annotations = [
                        ...annotationsObj.annotations,
                        ...result.annotations,
                      ];
                    } else {
                      annotationsObj.annotations = result.annotations;
                    }
                    fileDataTmp.Instant_Json__c =
                      JSON.stringify(annotationsObj);
                    setCurrentFile(fileDataTmp);
                  } else {
                    fileDataTmp.Instant_Json__c = JSON.stringify(result);
                    setCurrentFile(fileDataTmp);
                  }
                })
                .catch(error => {
                  alert('Failed to Save Annotations');
                  console.log('failed add annotations:: ', error);
                });
            } else {
              // save offline
              handleSaveOfflineAnnotations(currentFile.Id, result);
            }
          } else {
            alert('Failed to Save Annotations');
            console.log('Failed to export annotations.');
          }
        })
        .catch(error => {
          alert('Failed to Save Annotations');
          console.log(JSON.stringify(error));
        });
    }
  };

  const _showAnnotations = (dataObj, cb = () => {}) => {
    docViewerRef.current
      .addAnnotations(dataObj)
      .then(result => {
        cb(result);
      })
      .catch(error => {
        alert(JSON.stringify(error));
      });
  };

  const handleShowHideAnnotations = () => {
    if (showAnnotations) {
      const annotations = docViewerRef.current.getAllUnsavedAnnotations();
      console.log('hideMarkupannotation', JSON.stringify(annotations));
    } else {
      // show annotations
      if (currentFile?.Instant_Json__c) {
        //console.log("pdfMarkup >>>>>>>>>>>>", pdfopenfiledata.markupJSON);
        let annotationList = JSON.parse(
          currentFile.Instant_Json__c,
        ).annotations;
        console.log('checking annotation values::>>', annotationList);
        const pdfMarkup = {
          format: 'https://pspdfkit.com/instant-json/v1',
          annotations: annotationList,
        };
        setStoreMarkup(annotationList);
        _showAnnotations(pdfMarkup, result => {
          if (result) {
            alert('Annotation was successfully added.');
            setShowAnnotations(true);
          } else {
            alert('Failed to add annotation.');
          }
        });
      }
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
          onPress={() => {
            handleParentFolder(item);
            setPrevious([...previous, item]);
          }}
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
          }>
          <View style={styles.buttonDown}>
            <TouchableOpacity>
              <FontAwesomeIcon type="FontAwesome" name="folder" color="#000" />
            </TouchableOpacity>
            <TouchableWithoutFeedback
              onPress={() => {
                handleFolderClick(item);
                setPrevious([...previous, item]);
              }}>
              <Text>{item?.value?.Name}</Text>
            </TouchableWithoutFeedback>
            {item?.download ? (
              <Ionicons
                style={{textAlign: 'center', marginTop: 15, marginBottom: 10}}
                type="Ionicons"
                name="checkmark-done"
                color="#00bfff"
                size={25}
              />
            ) : currentFolderId === item?.value?.Id && folderDownloadLoader ? (
              <ActivityIndicator />
            ) : (
              <TouchableWithoutFeedback
                onPress={() => {
                  setCurrentFolderId(item?.value?.Id);
                  setFolderDownloadLoader(true);
                  api.get(`/folderfiles/${item?.value?.Id}`).then(async res => {
                    res?.data.tree?.map(val => {
                      handleDownloadFolder(val, item?.value?.Name);
                    });
                    const updatedData = folderData?.map((valu, index) => {
                      if (valu?.value?.Id === item?.value?.Id) {
                        valu['download'] = true;
                      }
                      return valu;
                    });
                    setFolderData(updatedData);
                  });
                }}>
                <FontAwesomeIcon
                  type="FontAwesone"
                  name="download"
                  color="#000"
                />
              </TouchableWithoutFeedback>
            )}
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
            {item?.File_Name__c}
          </Text>
          <TouchableHighlight
            disabled={
              netInfo.type !== 'unknown' &&
              netInfo.isInternetReachable === false &&
              !item?.download
            }
            onPress={() => handleView(item)}>
            {/* <ShowThumbnail item={item} /> */}
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

  const handleBack = () => {
    const secondLastElement = previous?.slice(-2, -1);
    const lastElement = previous.slice(-1);
    const rejected = _.reject(previous, lastElement[0]);
    setPrevious(rejected);
    handleFolderClick(secondLastElement[0]);
  };

  const handleBackPdf = () => {
    let index = fileData?.findIndex(x => x.Id == currentFile?.Id);
    if (index !== -1) {
      let extension = '';
      let i = index;
      let pdfFOrward = {};
      while (extension !== 'pdf') {
        console.log('yyyyy', i);
        pdfFOrward = fileData[i];
        extension = pdfFOrward?.File_Type__c;
        i--;
      }
      handleView(pdfFOrward);
    }
  };

  const handleFrontPdf = () => {
    let index = fileData?.findIndex(x => x.Id == currentFile?.Id);
    console.log('index', index);
    if (index !== -1) {
      let extension = '';
      let i = index;
      let pdfFOrward = {};
      while (extension !== 'pdf') {
        console.log('front>>>>>>>>>', i);
        pdfFOrward = fileData[i];
        extension = pdfFOrward?.File_Type__c;
        i++;
      }
      handleView(pdfFOrward);
    }
  };

  return (
    <>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          {!fileToLoad && (
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
                    {previous?.length > 1 && (
                      <Button title="back" onPress={handleBack} />
                    )}
                    <View style={styles.mainBx}>
                      {fileData?.length === 0 ? (
                        <ActivityIndicator />
                      ) : (
                        <FlatList
                          data={folderData}
                          numColumns={isTablet ? 5 : 2}
                          horizontal={false}
                          renderItem={({item}) => <FolderView item={item} />}
                          ItemSeparatorComponent={() => (
                            <View
                              style={{
                                height: 10,
                              }}
                            />
                          )}
                          keyExtractor={item => item?.value?.Id}
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

          {/* view controlled */}
          {fileToLoad && (
            <View style={{flex: 1}}>
              {loader ? (
                <ActivityIndicator size="large" />
              ) : (
                <View>
                  <Ionicons
                    name="arrow-back-circle"
                    type="Ionicons"
                    onPress={() => handleBackPdf()}
                    size={50}
                  />
                  <Ionicons
                    name="arrow-forward-circle"
                    type="Ionicons"
                    onPress={() => handleFrontPdf()}
                    size={50}
                  />
                </View>
              )}

              <PSPDFKitView
                document={fileToLoad}
                showNavigationButtonInToolbar={true} // Show the navigation back button on Android.
                showCloseButton={true}
                ref={docViewerRef}
                fragmentTag="PDF1"
                style={{flex: 1}}
                onNavigationButtonClicked={handleClosePdf}
                onStateChanged={event => {
                  console.log(' count is ' + event?.pageCount);
                  let pageCount = event?.pageCount;
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 5,
                }}>
                <Button
                  onPress={handleShowHideAnnotations}
                  title={showAnnotations ? 'Hide Markup' : 'Show Markup'}
                  accessibilityLabel="Add Ink Annotation"
                />
                <Button
                  onPress={handleSaveAnnotations}
                  title="Save Annotations"
                />
                <Button
                  onPress={handlePublic}
                  title={markupAccess ? 'public' : 'private'}
                />
              </View>
            </View>
          )}
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
    margin: 5,
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
