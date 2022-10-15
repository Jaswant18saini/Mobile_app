import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createStackNavigator} from '@react-navigation/stack';
import ModalScreen from './Screens/ModalScreen';
import Home from './Screens/Home';

const Stack = createNativeStackNavigator();
const RootStack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      {/* <Stack.Navigator> */}

      <RootStack.Navigator>
        <RootStack.Screen name="Home" component={Home} />
        <RootStack.Group screenOptions={{presentation: 'modal'}}>
          <RootStack.Screen name="MyModal" component={ModalScreen} />
        </RootStack.Group>
      </RootStack.Navigator>
      {/* </Stack.Navigator> */}
      {/* <Stack.Navigator screenOptions={{presentation: 'modal'}}>
        <Stack.Screen name="Modal" component={ModalScreen} />
      </Stack.Navigator> */}
    </NavigationContainer>
  );
}

export default App;
