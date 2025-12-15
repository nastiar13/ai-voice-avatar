import { Avatar } from '@/components/Avatar';
import { SceneContainer } from '@/components/SceneContainer';
import { useLipsync } from '@/hooks/useLipsync';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ExperienceScreen() {
    const { lipsyncRef, speak } = useLipsync();
    const [inputText, setInputText] = useState('');
    const [debugMsg, setDebugMsg] = useState('Wait...');

    const handleSend = () => {
        if (!inputText.trim()) return;
        speak(inputText);
        setInputText('');
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* 3D Scene Layer */}
            <View style={styles.sceneLayer}>
                <SceneContainer>
                    <Avatar lipsyncRef={lipsyncRef} setDebug={setDebugMsg} />
                </SceneContainer>
            </View>

            <View style={{ position: 'absolute', top: 60, left: 20, right: 20, zIndex: 10 }}>
                <Text style={{ color: '#0f0', fontWeight: '900', fontSize: 16, backgroundColor: '#00000080', padding: 5 }}>
                    DEBUG: {debugMsg}
                </Text>
            </View>

            {/* UI Overlay Layer */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.uiLayer}
                pointerEvents="box-none"
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#888"
                        value={inputText}
                        onChangeText={setInputText}
                        returnKeyType="send"
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Text style={styles.sendButtonText}>Say</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    sceneLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    uiLayer: {
        flex: 1,
        zIndex: 2,
        justifyContent: 'flex-end',
        padding: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        borderRadius: 25,
        padding: 10,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        color: '#fff',
        paddingHorizontal: 15,
        height: 40,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginLeft: 10,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
