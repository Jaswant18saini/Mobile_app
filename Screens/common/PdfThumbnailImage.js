import React, {useEffect, useState} from 'react';
import {Image, ActivityIndicator} from 'react-native';
import PdfThumbnail from 'react-native-pdf-thumbnail';
import RNFS from 'react-native-fs';
import {TouchableHighlight} from 'react-native';

const PdfThumbnailImage = ({item, handleView, width, height}) => {
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
          textAlign: 'left',
          padding: 5,
          width: 40,
          height: 40,
          marginLeft: 'auto',
          marginRight: 'auto',
          flexWrap: 'wrap',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'flex-start',
        }}
      />
    </TouchableHighlight>
  ) : (
    <ActivityIndicator />
  );
};

export {PdfThumbnailImage};
