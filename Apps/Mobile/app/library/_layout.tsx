import { Stack } from 'expo-router';
import COLORS from '../../constants/Colors';

export default function LibraryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="music" />
      <Stack.Screen name="movies" />
      <Stack.Screen name="podcasts" />
    </Stack>
  );
}
