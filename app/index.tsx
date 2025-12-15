import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

export default function LandingScreen() {
    const [name, setName] = useState('');

    const startSession = async () => {
        if (!name.trim())
        {
            Alert.alert('Please enter your name');
            return;
        }

        try
        {
            const sessionId = uuidv4();
            await AsyncStorage.multiSet([
                ['user_name', name],
                ['session_id', sessionId],
                ['chat_history', '[]']
            ]);

            router.replace('/experience');
        } catch (e)
        {
            Alert.alert('Error starting session');
            console.error(e);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>AI Avatar Call</Text>
            <Text style={styles.subtitle}>Enter your name to begin</Text>

            <TextInput
                style={styles.input}
                placeholder="Your Name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
            />

            <TouchableOpacity style={styles.button} onPress={startSession}>
                <Text style={styles.buttonText}>Start Experience</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#aaa',
        marginBottom: 40,
    },
    input: {
        width: '100%',
        maxWidth: 300,
        height: 50,
        backgroundColor: '#222',
        borderRadius: 10,
        paddingHorizontal: 15,
        color: '#fff',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    button: {
        width: '100%',
        maxWidth: 300,
        height: 50,
        backgroundColor: '#007AFF', // iOS Blue
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
