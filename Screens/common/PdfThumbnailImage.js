import React, {useEffect, useState} from 'react';
import {Image, Text, ActivityIndicator} from 'react-native';
import PdfThumbnail from 'react-native-pdf-thumbnail';
import RNFS from 'react-native-fs';
import {TouchableHighlight} from 'react-native';

const PdfThumbnailImage = ({item, handleView}) => {
  const [imageUrl, setImageUrl] = useState('');
  useEffect(() => {
    PdfThumbnail.generate(
      `file://${RNFS.DocumentDirectoryPath}/${item?.Id}_pspdf.pdf`,
      0,
    ).then(res => {
      setImageUrl('');
      setImageUrl(res.uri);
    });
  }, [item]);

  return imageUrl ? (
    <TouchableHighlight onPress={() => handleView(item)}>
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
    </TouchableHighlight>
  ) : (
    <ActivityIndicator />
  );
};

export {PdfThumbnailImage};
