import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import {View, StyleSheet, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNetInfo} from '@react-native-community/netinfo';
import {create} from 'apisauce';
import {cloneDeep} from 'lodash';

const Sync = () => {
  const netInfo = useNetInfo();
  const api = create({
    baseURL: 'http://34.231.129.177',
    headers: {Accept: 'application/json'},
  });

  const [annotations, setAnnotations] = useState({});

  const handleDataSyncStorage = async (docId, index) => {
    const savedData = await AsyncStorage.getItem('OfflineAnnotations');
    if (savedData) {
      const savedDataJson = JSON.parse(savedData);
      if (savedDataJson[docId].length > 0) {
        savedDataJson[docId].splice(index, 1);
      } else {
        delete savedDataJson[docId];
      }
      try {
        await AsyncStorage.setItem(
          'OfflineAnnotations',
          JSON.stringify(savedDataJson),
        );
        setAnnotations(savedDataJson);
      } catch (error) {
        console.log('Offline sync Save annotations error: ', error);
      }
    }
  };

  const handleSyncAnnotations = () => {
    if (netInfo.isInternetReachable) {
      alert('synciing annotations');
      const offlineData = cloneDeep(annotations);
      Object.keys(offlineData).forEach(k => {
        offlineData[k].forEach((a, index) => {
          const successSynced = [];
          const jsonObj = JSON.parse(a);
          api
            .put(`/markup/${k}`, jsonObj)
            .then(success => {
              handleDataSyncStorage(k, index);
            })
            .catch(error => {
              console.log('error sync annotations ', error);
            });
        });
      });
    } else {
      alert('no data connection');
    }
  };

  useEffect(() => {
    const getOfflineAnnotations = async () => {
      const savedData = await AsyncStorage.getItem('OfflineAnnotations');
      console.log('saved offline annotations :: ', savedData);
      setAnnotations(JSON.parse(savedData));
    };
    getOfflineAnnotations();
  }, []);

  return (
    <View>
      <Text>Sync</Text>
      <View>
        <Text>Annotations</Text>
        <View>
          {Object.keys(annotations)?.map(k => (
            <View>
              <Text>{`Doc ID: ${k}`}</Text>
              <Text>{`Offline Annotations: ${annotations[k].length}`}</Text>
            </View>
          ))}
        </View>
        <View>
          <Button
            title="Sync Annotations"
            disabled={!netInfo.isInternetReachable}
            onPress={handleSyncAnnotations}
          />
        </View>
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  offlineLabel: {
    textAlign: 'center',
    backgroundColor: 'red',
  },
});

export default Sync;
