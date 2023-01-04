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
import _, {wrap} from 'lodash';
import PSPDFKitView from 'react-native-pspdfkit';
import {cloneDeep} from 'lodash';
import {horizontalScale, moderateScale, verticalScale} from '../../Metrics';
import DeviceInfo from 'react-native-device-info';
import {ShowThumbnail} from '../../common/ShowThumbnail';

const Documents = ({navigation, ...props}) => {
  const [breadCrumList, setBreadCrumList] = useState([]);
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
  const [annotationsObj, setAnnotationsObj] = useState();
  //a0f0r000000vIrEAAU
  const [projectOptions, setProjectOptions] = useState([]);
  const [userId, setUserId] = useState([]);
  const [fileToLoad, setFileToLoad] = useState(null);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [markupAccess, setMarkupAccess] = useState(false);
  const [annotations, setAnnotations] = useState({});
  const [currentParentFolder, setCurrentParentFolder] = useState();

  const docViewerRef = React.createRef(null);
  var pageCount = 0;
  // console.log('horizontalScale', currentFile?.id);
  //  console.log('folderData', fileData);

  const isTablet = DeviceInfo.isTablet();
  console.log(isTablet);

  const api = create({
    baseURL: 'http://34.231.129.177',
    headers: {Accept: 'application/json'},
  });

  // console.log('projectOptions', projectOptions);

  useEffect(() => {
    if (currentParentFolder) {
      handleParentFolder(currentParentFolder);
    }
  }, [currentParentFolder]);

  useEffect(() => {
    if (currentParentFolder) {
      handleParentFolder(currentParentFolder);
    }
  }, [currentParentFolder]);

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
    // console.log('LoginInfo>llllllllllllllllllllll', LoginInfo);
    await api
      .get(
        `/get_all_project?token=${LoginInfo.access_token}&instanceUrl=${LoginInfo.instance_url}`,
      )
      .then(res => {
        //  console.log('ccccc', res);
        if (res?.status === 200) {
          let ProjectOptions = [];
          //  console.log(
          //   'ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
          //  );
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

  const handleDataSyncStorage = async (docId, index) => {
    const savedData = await AsyncStorage.getItem('OfflineAnnotations');
    if (savedData) {
      const savedDataJson = JSON.parse(savedData);
      if (savedDataJson[docId].length > 0) {
        delete savedDataJson[docId];
      } else {
        delete savedDataJson[docId];
      }
      try {
        await AsyncStorage.removeItem(
          'OfflineAnnotations',
          JSON.stringify(savedDataJson[docId]),
        );
        //  setAnnotations(savedDataJson);
      } catch (error) {
        console.log('Offline sync Save annotations error: ', error);
      }
    }
  };

  const handleSyncAnnotations = () => {
    console.log('sync using');
    if (netInfo.isInternetReachable) {
      alert('synciing annotations');
      const offlineData = cloneDeep(annotations);
      Object.keys(offlineData).forEach(k => {
        offlineData[k].forEach((a, index) => {
          const successSynced = [];
          const jsonObj = JSON.parse(a);
          api
            .put(`/markup/${k}`, jsonObj)
            .then(success => {
              handleDataSyncStorage(k, index);
            })
            .catch(error => {
              console.log('error sync annotations ', error);
            });
        });
      });
    } else {
      // alert('no data connection');
    }
  };

  function Allfolder() {
    //  console.log('newwwwwwwwww', selectedProjectId);
    setLoading(true);
    api
      .get(`/folder?projectId=${selectedProjectId}`)
      .then(async res => {
        console.log('Hello', res);
        setLoading(false);
        setParentFolder(res?.data?.tree?.children);
        setFolderData(null);
        setFileData(null);
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
    //  console.log('loginInfo', loginInfo);
    const loginInfo = await AsyncStorage.getItem('loginInfo');
    return loginInfo;
  };
  useEffect(() => {
    //  console.log('documents', props);

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

  const getOfflineAnnotations = async () => {
    const savedData = await AsyncStorage.getItem('OfflineAnnotations');
    console.log('saved offline annotations :: ', savedData);
    setAnnotations(JSON.parse(savedData));
  };

  const handleClosePdf = () => {
    setShowAnnotations(false);
    setMarkupAccess(false);
    setFileToLoad(null);
    /* getOfflineAnnotations();
    if(annotations){
      handleSyncAnnotations();
    }*/
  };

  const checkNet = async () => {
    const value = await AsyncStorage.getItem('AllFolders');
    // console.log('itemmm', value);
    item = JSON.parse(value);

    setParentFolder(item);
  };

  useEffect(() => {
    if (netInfo.type !== 'unknown' && netInfo.isInternetReachable === false) {
      checkNet();
    } else {
      Allfolder();
      /*   getOfflineAnnotations();
      if(annotations){
        handleSyncAnnotations();
      }*/
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

  useEffect(() => {
    setTimeout(() => {
      if (fileToLoad) {
        if (docViewerRef?.current) {
          console.log('doc viewer is available');
          if (currentFile?.Instant_Json__c) {
            console.log(
              'value of instant >>>>>>>>>>>>',
              currentFile?.Instant_Json__c,
            );

            let annotationList = JSON.parse(
              currentFile.Instant_Json__c,
            ).annotations;
            console.log('checking annotation values::>>', annotationList);
            const pdfMarkup = {
              format: 'https://pspdfkit.com/instant-json/v1',
              annotations: annotationList,
            };

            docViewerRef.current.addAnnotations(pdfMarkup);

            docViewerRef.current
              .saveCurrentDocument()
              .then(success => {
                if (success) {
                  alert('1');
                } else {
                  alert('2');
                }
              })
              .catch(error => {
                alert('3');
              });
            setStoreMarkup(currentFile?.Instant_Json__c);
          }
        }
      }
    }, 1000);
    setTimeout(() => {
      getOfflineAnnotations();
      if (annotations) {
        handleSyncAnnotations();
      }
    }, 1000);
  }, [fileToLoad]);

  const handleView = val => {
    console.log('instant json1111::', val.Instant_Json__c);

    //console.log("pdfMarkup >>>>>>>>>>>>", pdfopenfiledata.markupJSON);

    //  console.log('checking annotation values::>>444', annotationList);

    setCurrentFile(val);
    //console.log("mark values::>>",val);
    // console.log("checking values of files::>>", annotationList);
    if (!val?.download && netInfo.isInternetReachable === true) {
      console.log('instant json1111::', val.Instant_Json__c);
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
          ? `${RNFS.DocumentDirectoryPath}/${val?.File_Name__c}`
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
    let filteredData = breadCrumList?.filter(val => val.Id == item?.value?.Id);
    if (filteredData?.length == 0) {
      let breadCrumData = {
        Id: item?.value?.Id,
        Name: item?.value?.Name,
      };
      let oldBreadcrumData = [];
      oldBreadcrumData.push(breadCrumData);
      setBreadCrumList(oldBreadcrumData);
    }
    getOfflineAnnotations();
    if (annotations != null) {
      handleSyncAnnotations();
    }
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
      console.log('id of folder ::', item?.value?.Id);
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

  const handleFolderClick = async (item, section = '') => {
    if (section == '') {
      let filteredData = breadCrumList?.filter(
        val => val.Id == item?.value?.Id,
      );
      if (filteredData?.length == 0) {
        let breadCrumData = {
          Id: item?.value?.Id,
          Name: item?.value?.Name,
        };
        let oldBreadcrumData = breadCrumList;
        oldBreadcrumData.push(breadCrumData);
        setBreadCrumList(oldBreadcrumData);
      }
    }
    console.log('folder path', item?.children),
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
        //    console.log('Offline Save annotations error: ', error);
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
            // result is new json
            console.log('save result', JSON.stringify(result));

            let annotationList = JSON.parse(
              currentFile.Instant_Json__c,
            ).annotations;
            console.log('save result2', annotationList);

            let e = 0;
            for (e = 0; e < result.annotations.length; e++) {
              if (result.annotations[e].customData == undefined) {
                let customData = {
                  userId: userId1,
                  userFullName: userName,
                  source: 'save_annotation',
                  access: publicPrivate,
                };
                //  console.log('save result2', JSON.stringify(storeMarkup));
                // old json

                //  console.log("customData ::", customData);
                result.annotations[e]['customData'] = customData;
                //  result.annotations['annotations'] = annotationList;
                //const resultData = result.get().set("customData", customData)
                // console.log('Size  :: ' + result.annotations.length);

                //  result.annotations = storeMarkup.annotations
                console.log('save result3', JSON.stringify(result));

                // changes related to merge of old and new json
              }
            }

            // add new element to e
            if (annotationList) {
              for (let f = 0; f < annotationList.length; f++) {
                result.annotations[e] = annotationList[f];
                e++;
              }
            }

            console.log('updated result is ' + JSON.stringify(result));

            //  let annotationList = JSON.parse(currentFile.Instant_Json__c).annotations;
            // result['annotations'] = annotationList;
            // console.log('save result3', JSON.stringify(result));
            if (netInfo.isInternetReachable) {
              // save api call.
              //  console.log('current selected file ', currentFile);
              // console.log("json for markup",JSON.stringify(result));

              api
                .put(`/markup/${currentFile.Id}`, result)
                .then(success => {
                  // console.log('success add annotations:: ', success);
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
              console.log('print offline');
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
        setShowAnnotations(true);

        cb(result);
      })
      .catch(error => {
        alert('error in ' + JSON.stringify(error));
      });
  };

  const handleShowHideAnnotations = async () => {
    if (showAnnotations) {
      docViewerRef.current
        .saveCurrentDocument()
        .then(success => {
          if (success) {
            //   alert('1');
          } else {
            alert('2');
          }
        })
        .catch(error => {
          alert('3');
        });

      //const annts =  docViewerRef.current.getAnnotations(0, "pspdfkit/ink");
      //      console.log(' all annotations ' + JSON.stringify(annts));

      //   console.log("hideMarkupannotation",JSON.stringify(annotations));
      var newNum = 'noView';
      var newVal = false;
      var oldNum = 'noPrint';
      var oldVal = false;
      docViewerRef.current.getAnnotations(0, 'pspdfkit/ink').then(result => {
        console.log('resultify', result);
        for (let e = 0; e < result.annotations.length; e++) {
          result.annotations[e][newNum] = newVal;
          result.annotations[e][oldNum] = oldVal;
          result.annotations[e]['opacity'] = 1;
          console.log('resut ::', result);
          //   const deepClone = JSON.parse(JSON.stringify(result.annotations[e]));
          //  console.log('remove ann is ' + JSON.stringify(deepClone));
          docViewerRef.current
            .removeAnnotation(result.annotations[e])
            .then(result => {
              if (result) {
                //  alert('Annotation was successfully Removed.');
                setShowAnnotations(false);
              } else {
                alert('Failed to remove annotation.');
              }
            })
            .catch(error => {
              console.log('remove error :: ', JSON.stringify(error));
            });
        }
        //  docViewerRef.current.removeAnnotation( result.annotations)

        const pdfMarkup = {
          format: 'https://pspdfkit.com/instant-json/v1',
          annotations: result.annotations,
        };
        console.log('resut11 ::', pdfMarkup);
        docViewerRef.current
          .addAnnotations(pdfMarkup)
          .then(result => {
            if (result) {
              //  alert('Annotation was successfully Add.');
              setShowAnnotations(false);
            } else {
              alert('Failed to add annotation.');
            }
          })
          .catch(error => {
            console.log('add error :: ', JSON.stringify(error));
          });
      });
    } else {
      docViewerRef.current
        .saveCurrentDocument()
        .then(success => {
          if (success) {
            //   alert('1');
          } else {
            alert('2');
          }
        })
        .catch(error => {
          alert('3');
        });

      //const annts =  docViewerRef.current.getAnnotations(0, "pspdfkit/ink");
      //      console.log(' all annotations ' + JSON.stringify(annts));

      //   console.log("hideMarkupannotation",JSON.stringify(annotations));
      var newNum = 'noView';
      var newVal = true;
      var oldNum = 'noPrint';
      var oldVal = true;
      docViewerRef.current.getAnnotations(0, 'pspdfkit/ink').then(result => {
        console.log('resultify', result);
        for (let e = 0; e < result.annotations.length; e++) {
          result.annotations[e][newNum] = newVal;
          result.annotations[e][oldNum] = oldVal;
          result.annotations[e]['opacity'] = 0;
          console.log('resut ::', result);
          //   const deepClone = JSON.parse(JSON.stringify(result.annotations[e]));
          //  console.log('remove ann is ' + JSON.stringify(deepClone));
          docViewerRef.current
            .removeAnnotation(result.annotations[e])
            .then(result => {
              if (result) {
                //  alert('Annotation was successfully Removed.');
                setShowAnnotations(false);
              } else {
                alert('Failed to remove annotation.');
              }
            })
            .catch(error => {
              console.log('remove error :: ', JSON.stringify(error));
            });
        }
        //  docViewerRef.current.removeAnnotation( result.annotations)

        const pdfMarkup = {
          format: 'https://pspdfkit.com/instant-json/v1',
          annotations: result.annotations,
        };
        console.log('resut11 ::', pdfMarkup);
        docViewerRef.current
          .addAnnotations(pdfMarkup)
          .then(result => {
            if (result) {
              //  alert('Annotation was successfully Add.');
              setShowAnnotations(true);
            } else {
              alert('Failed to add annotation.');
            }
          })
          .catch(error => {
            console.log('add error :: ', JSON.stringify(error));
          });
      });
      // show annotations
    }
  };

  const Buttons = ({item}) => {
    //   console.log('item', item);
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
            setCurrentParentFolder(item);
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
                handleFolderClick(item, '');
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
    // console.log("checking download item",item);
    // console.log("is downlaod? ::",item?.download);
    // console.log("instant json22222 ::", item.Instant_Json__c);
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
            <ShowThumbnail item={item} />
            {/* <Image
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
            /> */}
          </TouchableHighlight>
          {currentFile.Id === item?.Id && loader && (
            <ActivityIndicator hidesWhenStopped={true} />
          )}
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
            <ActivityIndicator hidesWhenStopped={true} />
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
    let oldValue = breadCrumList.filter(function (member, index) {
      return index !== breadCrumList.length - 1;
    });
    setBreadCrumList(oldValue);
    const secondLastElement = previous?.slice(-2, -1);
    const lastElement = previous.slice(-1);
    const rejected = _.reject(previous, lastElement[0]);
    setPrevious(rejected);
    handleFolderClick(secondLastElement[0], 'handleBack');
  };

  const handleBackPdf = () => {
    let index = fileData?.findIndex(x => x.Id == currentFile?.Id);
    console.log('indexBack', index);
    if (index !== -1 && index > 0) {
      let extension = '';
      let i = index;
      let pdfFOrward;
      while (extension !== 'pdf') {
        console.log('yyyyy', i--);
        console.log('filesdata ::: ', fileData);
        pdfFOrward = fileData[i--];

        extension = pdfFOrward?.File_Type__c;
        i--;
      }
      setCurrentFile();
      console.log('pdfFOrwardBack', pdfFOrward);
      setCurrentFile(pdfFOrward);
      handleView(pdfFOrward);
    }
  };

  const handleFrontPdf = () => {
    let index = fileData?.findIndex(x => x.Id == currentFile?.Id);
    console.log('indexFront', index);

    if (index !== -1 && fileData?.length > index + 1) {
      let extension = '';
      let i = index;
      let pdfFOrward;
      while (extension !== 'pdf') {
        //   console.log(' i1 is ' + i);
        console.log('i>>>>>>>>>>', i++);
        //  console.log(' i2 is ' + i);
        //   console.log("filesdata ::: ", fileData);
        pdfFOrward = fileData[i++];
        extension = pdfFOrward?.File_Type__c;
        i++;
      }
      setCurrentFile();
      console.log('pdfFOrwardFront', pdfFOrward);
      setCurrentFile(pdfFOrward);
      handleView(pdfFOrward);
    }
  };

  const handleBreadCrumb = id => {
    let item = previous?.filter(val => val?.value?.Id == id);
    let index = breadCrumList?.findIndex(x => x.Id == id);
    let data = breadCrumList?.slice(0, index + 1);
    setBreadCrumList(data);
    handleFolderClick(item[0], 'handleBreadCrumb');
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
                <View style={styles.breadcrumbParent}>
                  {breadCrumList?.map((val, index) => {
                    return (
                      <Text
                        onPress={() => handleBreadCrumb(val?.Id)}
                        style={styles.breadcrumb}>
                        {val?.Name}
                        {breadCrumList?.length <= index + 1 ? '' : ' > '}
                      </Text>
                    );
                  })}
                </View>
                <View>
                  <FlatList
                    style={styles.button}
                    data={parentFolder}
                    renderItem={breadCrumList?.length < 2 && Buttons}
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
                    {/* {previous?.length > 1 && (
                      <Text onPress={handleBack} style={styles.link}>
                        back
                      </Text>
                    )} */}
                    <View style={styles.mainBx}>
                      {fileData?.length < 0 ? (
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

                    {fileData?.length < 0 ? (
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
              <View style={styles.pdfbutton}>
                <Ionicons
                  style={styles.iconbtn}
                  name="arrow-back-circle"
                  type="Ionicons"
                  onPress={() => handleBackPdf()}
                  size={50}
                />
                <Ionicons
                  style={styles.iconbtn}
                  name="arrow-forward-circle"
                  type="Ionicons"
                  onPress={() => handleFrontPdf()}
                  size={50}
                />
              </View>

              {loader ? (
                <View style={styles.activity}>
                  <ActivityIndicator size="large" />
                </View>
              ) : (
                <PSPDFKitView
                  document={fileToLoad}
                  showNavigationButtonInToolbar={true} // Show the navigation back button on Android.
                  showCloseButton={true}
                  ref={docViewerRef}
                  disabledAutomaticSaving={true}
                  fragmentTag="PDF1"
                  style={{flex: 1, height: 100}}
                  onNavigationButtonClicked={handleClosePdf}
                  onCloseButtonPressed={handleClosePdf}
                  onStateChanged={event => {
                    console.log(' count is ' + event?.pageCount);
                    pageCount = event?.pageCount;
                  }}
                />
              )}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 5,
                  justifyContent: 'center',
                  gap: 20,
                }}>
                <Button
                  onPress={handleShowHideAnnotations}
                  title={showAnnotations ? 'Show Markup' : 'Hide Markup'}
                  accessibilityLabel="Add Ink Annotation"
                />
                <Button
                  style={{margin: 10}}
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
    alignItems: 'flex-start',
    backgroundColor: '#e7ecf0',
    flexDirection: 'row',
    padding: 15,
    flexWrap: 'wrap',
    textAlign: 'left',
  },
  scrollView: {},
  buttonDown: {
    backgroundColor: 'white',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 165,
    flex: 1,
    alignSelf: 'flex-start',
    color: '#000',
    margin: 5,
    marginVertical: 10,
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
  link: {
    color: '#1e9bee',
    fontWeight: '800',
    marginBottom: 15,
    maxWidth: 100,
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: 20,
  },
  breadcrumb: {
    fontSize: 14,
    color: '#1e9bee',
  },
  breadcrumbParent: {
    flexDirection: 'row',
  },
  pdfbutton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  activity: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '88%',
  },
});
export default Documents;
