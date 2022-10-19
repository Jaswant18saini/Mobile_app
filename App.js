import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Home from './Screens/Home';
import NewScreen from './Screens/components/Newscreen';
import Issues from './Screens/components/Issue/Index';
import Checklists from './Screens/components/CheckLists';
import Sync from './Screens/components/Sync';
import DialyLogs from './Screens/components/Dialy-logs';
import More from './Screens/components/More';

const RootStack = createStackNavigator();

function App() {
  const Tab = createBottomTabNavigator();
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused
                  ? 'ios-information-circle'
                  : 'ios-information-circle-outline';
              } else if (route.name === 'Documents') {
                iconName = focused ? 'ios-list-box' : 'md-copy-outline';
              } else if (route.name === 'Issue') {
                iconName = focused ? 'ios-list-box' : 'ios-list';
              } else if (route.name === 'Checklists') {
                iconName = focused ? 'ios-list-box' : 'ios-list';
              } else if (route.name === 'Sync') {
                iconName = focused ? 'ios-list-box' : 'ios-list';
              } else if (route.name === 'Daily-logs') {
                iconName = focused ? 'ios-list-box' : 'ios-list';
              }
              // } else if (route.name === '') {
              //   iconName = focused ? 'ios-list-box' : 'ios-list';
              // }

              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
          })}>
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Documents" component={NewScreen} />
          <Tab.Screen name="Issue" component={Issues} />
          <Tab.Screen name="Checklists" component={Checklists} />
          <Tab.Screen name="Sync" component={Sync} />
          <Tab.Screen name="Daily-logs" component={DialyLogs} />
          {/* <Tab.Screen name="More" component={More} /> */}
        </Tab.Navigator>
      </SafeAreaProvider>
    </NavigationContainer>
  );
}

export default App;
