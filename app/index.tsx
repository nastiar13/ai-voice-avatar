import { Avatar } from '@/components/Avatar';
import { SceneContainer } from '@/components/SceneContainer';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LandingScreen() {
    const enterExperience = () => {
        router.push('/experience');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>AI Voice Avatar</Text>
                <Text style={styles.subtitle}>
                    Interactive 3D avatar with real-time lip sync
                </Text>
            </View>

            {/* Interactive Avatar Preview */}
            <View style={styles.previewContainer}>
                <View style={styles.avatarWrapper}>
                    <SceneContainer enableOrbitControls enableZoom={false}>
                        <Avatar />
                    </SceneContainer>
                </View>
                <Text style={styles.interactHint}>👆 Drag to rotate</Text>
            </View>

            {/* Features */}
            <View style={styles.features}>
                <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🗣️</Text>
                    <Text style={styles.featureText}>Natural Speech</Text>
                </View>
                <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🎯</Text>
                    <Text style={styles.featureText}>Real-time Lipsync</Text>
                </View>
                <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>✨</Text>
                    <Text style={styles.featureText}>3D Graphics</Text>
                </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity style={styles.button} onPress={enterExperience}>
                <Text style={styles.buttonText}>Enter Experience</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
        padding: 24,
    },
    header: {
        marginTop: 50,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    },
    previewContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    avatarWrapper: {
        width: 300,
        height: 350,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#2a2a4e',
    },
    interactHint: {
        color: '#666',
        fontSize: 12,
        marginTop: 12,
    },
    features: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
    },
    featureItem: {
        alignItems: 'center',
    },
    featureIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    featureText: {
        fontSize: 11,
        color: '#aaa',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#6366f1',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
