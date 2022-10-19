import React, {useEffect, useState} from 'react';
import {Icon} from '@rneui/themed';
import {View, Text, Button} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {create} from 'apisauce';
import Header from './Header';

const NewScreen = () => {
  const [parentFolder, setParentFolder] = useState();
  const api = create({
    baseURL: 'http://34.231.129.177',
    headers: {Accept: 'application/json'},
  });

  function Allfolder() {
    api
      .get('/folder?projectId=a0f0r000000vIrEAAU')
      .then(res => setParentFolder(res?.data?.tree));
  }

  useEffect(() => {
    console.log('hererererer');
    Allfolder();
  }, []);
  console.log('parentFolder', parentFolder);

  const handleParentFolder = id => {
    console.log('Iddd', id);
  };

  const Buttons = parentFolder?.childern?.map((val, index) => {
    console.log('val', val);

    return (
      <View>
        <Button
          title={val?.value?.Name}
          onPress={() => {
            handleParentFolder(val?.value?.Id);
          }}
        />
      </View>
    );
  });

  return (
    <>
      <View>
        <Header />
        <View>{Buttons}</View>
      </View>
      <View>
        <View>
          <Text>Folders</Text>
          <View>
            <TouchableOpacity onPress={null}>
              <Icon type="FontAwesome" name="folder" color="grey" />
            </TouchableOpacity>
            <Text>"Demo"</Text>
            <TouchableOpacity onPress={null}>
              <Icon type="EvilIcons" name="search" color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <Text>Documents</Text>
          <View></View>
        </View>
      </View>
    </>
  );
};
export default NewScreen;
