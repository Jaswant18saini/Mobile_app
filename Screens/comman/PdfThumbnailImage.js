import React, {useEffect, useState} from 'react';
import {Image, Text, ActivityIndicator} from 'react-native';
import PdfThumbnail from 'react-native-pdf-thumbnail';
import RNFS from 'react-native-fs';

const PdfThumbnailImage = ({item}) => {
  const [imageUrl, setImageUrl] = useState('');
  useEffect(() => {
    PdfThumbnail.generate(
      `file://${RNFS.DocumentDirectoryPath}/${item?.Id}.pdf`,
      0,
    ).then(res => {
      setImageUrl(res.uri);
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

export {PdfThumbnailImage};
