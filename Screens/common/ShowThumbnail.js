import React, {useEffect, useState} from 'react';
import {Image, Text, ActivityIndicator} from 'react-native';
import PdfThumbnail from 'react-native-pdf-thumbnail';
import RNFS from 'react-native-fs';

const ShowThumbnail = ({item}) => {
  const [imageUrl, setImageUrl] = useState('');
  console.log('pdfUrl', item?.url, item);
  useEffect(() => {
    const ThumbnailCreate = async () => {
      const localFile = `${RNFS.DocumentDirectoryPath}/${item.File_Name__c}`;
      const options = {
        fromUrl: item.url,
        toFile: localFile,
      };

      // last step it will download open it with fileviewer.
      RNFS.downloadFile(options)
        .promise.then(() => {
          setTimeout(() => {
            PdfThumbnail.generate(
              `file://${RNFS.DocumentDirectoryPath}/${item?.File_Name__c}`,
              // 'file://' + RNFS.DocumentDirectoryPath + item?.File_Name__c,
              0,
            ).then(res => {
              console.log('PDF URI', res.uri);
              setImageUrl(res.uri);
            });
          }, 2000);
        })

        .catch(error => {
          // error
        });
    };
    if (item?.File_Type__c === 'pdf') {
      try {
        ThumbnailCreate();
      } catch (err) {
        console.log('error', error);
      }
    }
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
