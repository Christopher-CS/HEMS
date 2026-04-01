import React, { useContext, useState } from 'react'
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native'
import { AuthContext } from '../_layout'
import { Link } from 'expo-router'

export default function SignUpPage() {
  const { signIn } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable style={styles.button} onPress={signIn}>
        <Text style={styles.buttonText}>Create Account</Text>
      </Pressable>

      <Link href="/auth/sign-in">
        <Text style={styles.link}>Already have an account? Sign In</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  input: { backgroundColor: '#1E1F2E', padding: 14, borderRadius: 10, color: '#fff' },
  button: { backgroundColor: '#4C65E4', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: '#4C65E4', marginTop: 12, textAlign: 'center' },
})