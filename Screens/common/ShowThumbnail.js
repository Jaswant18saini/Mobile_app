import React, {useEffect, useState} from 'react';
import {Image, ActivityIndicator} from 'react-native';
import PdfThumbnail from 'react-native-pdf-thumbnail';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';

const ShowThumbnail = ({item}) => {
  const [imageUrl, setImageUrl] = useState('');
  console.log('pdfUrl', item?.url, item);
  const image = {};
  useEffect(() => {
    const pathFile = `${RNFS.DocumentDirectoryPath}/${item.File_Name__c}_thumb`;
    console.log('pathFile', pathFile);
    RNFetchBlob.fs
      .exists(pathFile)
      .then(exist => {
        if (exist) {
          setImageUrl(pathFile);
        } else {
          const ThumbnailCreate = async () => {
            const localFile = `${RNFS.DocumentDirectoryPath}/${item.File_Name__c}_thumb`;
            const options = {
              fromUrl: item.url,
              toFile: localFile,
            };

            // last step it will download open it with fileviewer.
            RNFS.downloadFile(options)
              .promise.then(() => {
                setTimeout(() => {
                  PdfThumbnail.generate(
                    `file://${RNFS.DocumentDirectoryPath}/${item?.File_Name__c}_thumb`,
                    // 'file://' + RNFS.DocumentDirectoryPath + item?.File_Name__c,
                    0,
                  ).then(res => {
                    console.log('PDF URI>>>', res.uri);
                    setImageUrl(res.uri);
                  });
                }, 2000);
              })

              .catch(error => {
                console.log('error', error);
              });
          };
          if (item?.File_Type__c === 'pdf') {
            try {
              ThumbnailCreate();
            } catch (err) {}
          }
        }
        console.log(`file ${exist ? '' : 'not'} exists`);
      })
      .catch(error => {
        console.log('error', error);
      });
  }, [item]);

  return item?.File_Type__c != 'pdf' ? (
    <Image
      source={require('../../assets/thumbnailDemo.webp')}
      style={{
        width: '100%',
        height: 150,
        marginLeft: 'auto',
        marginRight: 'auto',
        flexWrap: 'wrap',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
      }}
    />
  ) : imageUrl ? (
    <Image
      source={{uri: imageUrl}}
      style={{
        width: '100%',
        height: 150,
        marginLeft: 'auto',
        marginRight: 'auto',
        flexWrap: 'wrap',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
      }}
    />
  ) : (
    <ActivityIndicator />
  );
};

export {ShowThumbnail};
