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
        return (item.thumbnail = '');
      });
      setFileData(res?.data?.tree);
    });
  };

  const Buttons = ({item}) => {
    console.log("item",item);
    return (
      <View
        key={item?.value?.Id}
        style={{ 
          padding: 10,  width: '49%',
          marginLeft: 'auto', 
          marginRight: 'auto',
        }}
        >
          
        <Button 
          title={item?.value?.Name}        
          onPress={() => handleParentFolder(item)}
        />
      </View>
    );
  };

  const FolderView = ({item}) => {
    return (
      <View style={styles.buttonDown}>
        <TouchableOpacity onPress={null}>
          <Icon type="FontAwesome" name="folder" color="#000" />
        </TouchableOpacity>
        <Text>{item?.value?.Name}</Text>
        <TouchableOpacity onPress={null}>
          <Icon type="FontAwesone" name="download" color="#000" />
        </TouchableOpacity>
      </View>
    );
  };

  const FilesView = ({item}) => {
    const data = {
      image: require('../../../assets/thumbnailDemo.webp'),
    };
    return (
      // <ScrollView>
        <View style={styles.Boxwrapper}>
          <Text style={[styles.textName,{fontWeight: '900', color: '#333'}]} >{item?.Name}</Text>
          <Image source={data?.image} style={[{width: 100, height: 100 ,marginLeft: 'auto',marginRight: 'auto',flexWrap: 'wrap',alignItems: 'center',flex: 1,justifyContent: 'center'}]} />
          <Icon style={{textAlign: 'center', marginTop: 15,marginBottom: 10,}} type="FontAwesone" name="download" color="#000" />
        </View>
      // </ScrollView>
    );
  };

  return (
    <>
      <View>
        <Header />
        <View >
          <FlatList style={styles.button}
            data={parentFolder}
            renderItem={Buttons}
            numColumns={2} horizontal={false}
            keyExtractor={item => item.value.Id} 
          />
        </View>
      </View>
      <View>
        <View>
          <Text style={{textAlign: 'center',marginBottom: 10,}}>Folders</Text>
          <View style={styles.mainBx}>
          <FlatList  
            data={folderData}
            numColumns={2}
            horizontal={false}

            renderItem={FolderView}
            keyExtractor={item => item.value.Id}
          />
          </View>
        </View>
        <View style={{width:"100%", paddingHorizontal: 10}}>
          <Text style={{textAlign: 'center', marginTop: 15,marginBottom: 10,}}>Documents</Text>
          <FlatList
            data={fileData} numColumns={2}
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
  mainBx:{ 
    alignItems: "center",  
    flexDirection: "row",
    justifyContent: "center",    flexWrap: "wrap",  gap: '10px',
  },
  buttonDown:{
    backgroundColor: '#f7f7f7', 
    marginLeft: 0,
    padding: 10, 
    flexBasis: 50,
    flexDirection: 'row', 
    justifyContent: 'space-between',
     flex: 1,
    marginHorizontal: 20, margin: 4,
  }, 
  Boxwrapper: {  
    flexDirection: 'column',  
    borderWidth: 1,padding: 10,
    borderColor: '#ccc',
    borderStyle: 'solid',
    gap: '5px',flex: 1, 
    justifyContent: 'center',flex: 1,
    width: '100%',  margin: 10
  },
  textName:{
    textAlign: 'center',    
  }
});
export default Documents;
