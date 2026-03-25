import { Tabs } from 'expo-router';
import { Home, Library, Settings, Tv } from 'lucide-react-native';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#12131D',
          borderTopColor: '#1E1F2E',
          height: 90,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#4C65E4',
        tabBarInactiveTintColor: '#62667E',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="remote"
        options={{
          title: 'Remote',
          tabBarIcon: ({ color }) => <Tv color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <Library color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
