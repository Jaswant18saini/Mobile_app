import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNetInfo} from '@react-native-community/netinfo';
// import Home from './Screens/Home';
import Issues from './Screens/components/Issue/Index';
import Checklists from './Screens/components/CheckLists';
import Sync from './Screens/components/Sync';
import DialyLogs from './Screens/components/Dialy-logs';
import More from './Screens/components/More';
import Documents from './Screens/components/Documents';
import {Text, View, Linking, ActivityIndicator} from 'react-native';
import Login from './Screens/components/Login';
import Offline from './Screens/components/Offline';

function App() {
  const Tab = createBottomTabNavigator();
  const netInfo = useNetInfo();

  useEffect(() => {
    const linkvar = Linking.getInitialURL();
    console.log('linkvarnaagtibaaaa', linkvar);
  }, []);

  const linking = {
    prefixes: ['com.pspdfkitdemo://'],
    config: {
      screens: {
        Sync: 'oauth',
      },
    },
  };

  return (
    <NavigationContainer
      linking={linking}
      fallback={<ActivityIndicator color="blue" size="large" />}>

      <SafeAreaProvider>
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {
              let iconName;

              // if (route.name === 'Home') {
              //   iconName = focused ? 'ios-home-sharp' : 'ios-home-sharp';
              // } else
              if (route.name === 'Documents') {
                iconName = focused ? 'md-document' : 'md-document';
              } else if (route.name === 'Issue') {
                iconName = focused ? 'md-warning' : 'md-warning';
              } else if (route.name === 'Checklists') {
                iconName = focused ? 'ios-checkbox' : 'ios-checkbox';
              } else if (route.name === 'Sync') {
                iconName = focused
                  ? 'md-sync-circle-sharp'
                  : 'md-sync-circle-sharp';
              } else if (route.name === 'Daily-logs') {
                iconName = focused ? 'md-partly-sunny' : 'md-partly-sunny';
              } else if (route.name === 'More') {
                iconName = focused
                  ? 'md-ellipsis-horizontal-circle-sharp'
                  : 'md-ellipsis-horizontal-circle-outline';
              } else if (route.name === 'Login') {
                iconName = focused ? 'log-in' : 'log-in-outline';
              } else if (route.name === 'Offline Files') {
                iconName = focused ? 'log-in' : 'log-in-outline';
              }

              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'dodgerblue',
            tabBarInactiveTintColor: 'gray',
          })}>
          {/* <Tab.Screen name="Home" component={Home} /> */}
          <Tab.Screen name="Documents" component={Documents} />
          <Tab.Screen name="Issue" component={Issues} />
          <Tab.Screen name="Checklists" component={Checklists} />
          <Tab.Screen name="Login" component={Login} />
          <Tab.Screen name="Sync" component={Sync} />
          <Tab.Screen name="Daily-logs" component={DialyLogs} />
          <Tab.Screen name="More" component={More} />
          <Tab.Screen name="Offline Files" component={Offline} />
        </Tab.Navigator>
        {netInfo.type !== 'unknown' && netInfo.isInternetReachable === false ? (
          <View style={{alignItems: 'center'}}>
            <Text style={{fontWeight: 'bold'}}>No Internet Connection</Text>
          </View>
        ) : (
          ''
        )}
      </SafeAreaProvider>
    </NavigationContainer>
  );
}

export default App;
