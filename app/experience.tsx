import { Avatar } from '@/components/Avatar';
import { SceneContainer } from '@/components/SceneContainer';
import { useLipsync } from '@/hooks/useLipsync';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Keyboard, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Message {
    id: string;
    name: string;
    text: string;
}

export default function ExperienceScreen() {
    const { lipsyncRef, speak } = useLipsync();
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [keyboardOffset] = useState(new Animated.Value(0));

    useEffect(() => {
        const showListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                Animated.timing(keyboardOffset, {
                    toValue: e.endCoordinates.height,
                    duration: Platform.OS === 'ios' ? 250 : 0,
                    useNativeDriver: false,
                }).start();
            }
        );

        const hideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                Animated.timing(keyboardOffset, {
                    toValue: 0,
                    duration: Platform.OS === 'ios' ? 250 : 0,
                    useNativeDriver: false,
                }).start();
            }
        );

        return () => {
            showListener.remove();
            hideListener.remove();
        };
    }, []);

    const handleSpeak = () => {
        if (!message.trim()) return;

        Keyboard.dismiss();

        const newMsg: Message = {
            id: Date.now().toString(),
            name: name.trim() || 'Anonymous',
            text: message.trim(),
        };

        setCurrentMessage(newMsg);
        setIsSpeaking(true);

        speak(message);

        const duration = message.length * 80 + 1000;
        setTimeout(() => {
            setIsSpeaking(false);
        }, duration);

        setMessage('');
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* 3D Scene - Fixed */}
            <View style={styles.sceneLayer}>
                <SceneContainer enableOrbitControls enableZoom={false}>
                    <Avatar lipsyncRef={lipsyncRef} />
                </SceneContainer>
            </View>

            {/* Top Message Card */}
            {currentMessage && (
                <View style={styles.messageOverlay} pointerEvents="none">
                    <View style={styles.messageCard}>
                        <Text style={styles.messageName}>{currentMessage.name}</Text>
                        <Text style={styles.messageText}>{currentMessage.text}</Text>
                        {isSpeaking && (
                            <View style={styles.speakingBadge}>
                                <Text style={styles.speakingText}>🎙️ Speaking</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Bottom Input - Animated */}
            <Animated.View
                style={[styles.inputWrapper, { bottom: keyboardOffset }]}
            >
                <View style={styles.inputForm}>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.nameInput}
                            placeholder="Name"
                            placeholderTextColor="#666"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Message..."
                            placeholderTextColor="#666"
                            value={message}
                            onChangeText={setMessage}
                            returnKeyType="send"
                            onSubmitEditing={handleSpeak}
                        />
                        <TouchableOpacity
                            style={[styles.speakButton, !message.trim() && styles.speakButtonDisabled]}
                            onPress={handleSpeak}
                            disabled={!message.trim()}
                        >
                            <Text style={styles.speakButtonText}>▶</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    sceneLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    messageOverlay: {
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        zIndex: 10,
        alignItems: 'center',
    },
    messageCard: {
        backgroundColor: 'rgba(20, 20, 30, 0.9)',
        borderRadius: 16,
        padding: 16,
        maxWidth: 350,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.4)',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    messageName: {
        color: '#6366f1',
        fontWeight: '700',
        fontSize: 13,
        marginBottom: 4,
    },
    messageText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 22,
    },
    speakingBadge: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    speakingText: {
        color: '#6366f1',
        fontSize: 12,
        fontWeight: '600',
    },
    inputWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    inputForm: {
        backgroundColor: 'rgba(15, 15, 25, 0.95)',
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nameInput: {
        width: 80,
        backgroundColor: 'rgba(40, 40, 60, 0.8)',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#fff',
        fontSize: 14,
    },
    messageInput: {
        flex: 1,
        backgroundColor: 'rgba(40, 40, 60, 0.8)',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#fff',
        fontSize: 14,
    },
    speakButton: {
        backgroundColor: '#6366f1',
        borderRadius: 10,
        width: 44,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    speakButtonDisabled: {
        backgroundColor: '#3f3f5e',
    },
    speakButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});
