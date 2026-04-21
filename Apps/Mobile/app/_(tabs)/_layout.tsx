import React, { useContext, useEffect } from 'react'
import { Tabs } from 'expo-router'
import AuthContext from '../_layout'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'

export default function TabsLayout() {
  const { isSignedIn } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!isSignedIn) {
      // Redirect to auth sign-in
      router.replace('/auth/sign-in')
    }
  }, [isSignedIn])

  if (!isSignedIn) {
    // Optionally show nothing while redirecting
    return null
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 80, paddingBottom: 10, paddingTop: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="remote" options={{ title: 'Remote' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  )
}