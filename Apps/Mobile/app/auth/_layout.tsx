import React, { useContext } from 'react'
import { Slot } from 'expo-router'
import AuthContext from '../_layout'

export default function AuthLayout() {
  const { isSignedIn } = useContext(AuthContext)

  if (isSignedIn) {
    // If signed in, redirect to main tabs
    return <Slot />
  }

  return <Slot />
}