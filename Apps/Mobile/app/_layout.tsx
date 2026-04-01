import React from 'react'
import { Slot } from 'expo-router'
import { View, Text } from 'react-native'

export const AuthContext = React.createContext({
  isSignedIn: false,
  signIn: () => {},
  signOut: () => {},
})

export default function RootLayout() {
  const [isSignedIn, setIsSignedIn] = React.useState(false)

  const signIn = () => setIsSignedIn(true)
  const signOut = () => setIsSignedIn(false)

  return (
    <AuthContext.Provider value={{ isSignedIn, signIn, signOut }}>
      <Slot />
    </AuthContext.Provider>
  )
}