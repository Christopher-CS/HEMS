import { StyleSheet, Text, View } from 'react-native';
import COLORS from '../constants/Colors';

export default function Library() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>This is Library screen!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: COLORS.text,
    },
});
