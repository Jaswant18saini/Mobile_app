import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';
import {oauth, net} from 'react-native-force';

const Issue = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    console.log('Rum Pleaseeeee', oauth);

    oauth.getAuthCredentials(
      () => fetchData(), // already logged in
      () => {
        oauth.authenticate(
          () => fetchData(),
          error => console.log('Failed to authenticate:' + error),
        );
      },
    );
  }, []);

  const fetchData = () => {
    net.query('SELECT Id, Name FROM Contact LIMIT 100', response =>
      setData({data: response.records}),
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={({item}) => <Text style={styles.item}>{item.Name}</Text>}
        keyExtractor={(item, index) => 'key_' + index}
      />
    </View>
  );
};
export default Issue;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
    backgroundColor: 'white',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});
