import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DataTable} from 'react-native-paper';
import {create} from 'apisauce';

const Checklists = props => {
  const [data, setData] = useState();

  console.log('data', data);

  const api = create({
    baseURL: 'http://34.231.129.177',
    headers: {Accept: 'application/json'},
  });

  useEffect(() => {
    getTable();
  }, []);

  const getTable = async () => {
    const loginInfo = await AsyncStorage.getItem('loginInfo');

    const LoginInfo = JSON.parse(loginInfo);
    return await api
      .get(
        `/projectFormsLists?token=${LoginInfo.access_token}&instanceUrl=${LoginInfo.instance_url}`,
      )
      .then(res => {
        console.log('data123', res);
        if (res?.status === 200) {
          console.log('data', res);
          return setData(res);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <View style={styles.container}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Title</DataTable.Title>
          <DataTable.Title>Form Templete</DataTable.Title>
          <DataTable.Title numeric>Project Forms</DataTable.Title>
          <DataTable.Title numeric>Assigned To</DataTable.Title>
        </DataTable.Header>

        <DataTable.Row>
          <DataTable.Cell>John</DataTable.Cell>
          <DataTable.Cell>john@kindacode.com</DataTable.Cell>
          <DataTable.Cell numeric>33</DataTable.Cell>
        </DataTable.Row>

        <DataTable.Row>
          <DataTable.Cell>Bob</DataTable.Cell>
          <DataTable.Cell>test@test.com</DataTable.Cell>
          <DataTable.Cell numeric>105</DataTable.Cell>
        </DataTable.Row>

        <DataTable.Row>
          <DataTable.Cell>Mei</DataTable.Cell>
          <DataTable.Cell>mei@kindacode.com</DataTable.Cell>
          <DataTable.Cell numeric>23</DataTable.Cell>
        </DataTable.Row>
      </DataTable>
    </View>
  );
};
export default Checklists;

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingHorizontal: 30,
  },
});
