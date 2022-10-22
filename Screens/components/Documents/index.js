import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {create} from 'apisauce';
import Header from './Header';
import {createThumbnail} from 'react-native-create-thumbnail';
import {ScrollView} from 'react-native';

const Documents = () => {
  const [parentFolder, setParentFolder] = useState();
  const [folderData, setFolderData] = useState();
  const [fileData, setFileData] = useState();
  const api = create({
    baseURL: 'http://34.231.129.177',
    headers: {Accept: 'application/json'},
  });

  function Allfolder() {
    api
      .get('/folder?projectId=a0f0r000000vIrEAAU')
      .then(res => setParentFolder(res?.data?.tree?.children));
  }

  useEffect(() => {
    Allfolder();
  }, []);
  // console.log('parentFolder', parentFolder);
  // console.log('folderData', folderData);
  console.log('fileData', fileData);

  const handleParentFolder = item => {
    setFolderData(item?.children);

    api.get(`/folderfiles/${item?.value?.Id}`).then(res => {
      res?.data?.tree?.map(async item => {
        return (item['thumbnail'] = '');
      });
      setFileData(res?.data?.tree);
    });
  };

  const Buttons = ({item}) => {
    return (
      <View key={item?.value?.Id}>
        <Button
          title={item?.value?.Name}
          onPress={() => handleParentFolder(item)}
        />
      </View>
    );
  };

  const FolderView = ({item}) => {
    return (
      <View>
        <TouchableOpacity onPress={null}>
          <Icon type="FontAwesome" name="folder" color="grey" />
        </TouchableOpacity>
        <Text>{item?.value?.Name}</Text>
        <TouchableOpacity onPress={null}>
          <Icon type="FontAwesone" name="download" color="grey" />
        </TouchableOpacity>
      </View>
    );
  };

  const FilesView = ({item}) => {
    const data = {
      image: require('../../../assets/thumbnailDemo.webp'),
    };
    return (
      <ScrollView>
        <View>
          <Text>{item?.Name}</Text>
          <Image source={data?.image} style={[{width: 150, height: 150}]} />
          <Icon type="FontAwesone" name="download" color="grey" />
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
            data={parentFolder}
            renderItem={Buttons}
            keyExtractor={item => item.value.Id}
            horizontal
          />
        </View>
      </View>
      <View>
        <View>
          <Text>Folders</Text>
          <FlatList
            data={folderData}
            renderItem={FolderView}
            keyExtractor={item => item.value.Id}
          />
        </View>
        <View>
          <Text>Documents</Text>
          <FlatList
            data={fileData}
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
  },
});
export default Documents;
