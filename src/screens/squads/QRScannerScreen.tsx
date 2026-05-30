import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';
import { joinGroup, getGroup } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');
const MASK_DIMENSION = 250;

export default function QRScannerScreen({ navigation }: RootStackScreenProps<'QRScanner'>) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const { firebaseUser } = useAuth();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    // Expected format: "hopon-squad:[squadId]"
    if (data.startsWith('hopon-squad:')) {
      const squadId = data.replace('hopon-squad:', '');
      try {
        if (firebaseUser) {
          await joinGroup(squadId, firebaseUser.uid);
          const group = await getGroup(squadId);
          navigation.replace('SquadDetail', { squadId, squadName: group?.name || 'Joined Squad', squadAvatar: group?.avatar });
        } else {
          alert('You must be logged in to join a squad');
          navigation.goBack();
        }
      } catch (error) {
        alert('Failed to join squad: ' + error);
        setTimeout(() => setScanned(false), 2000);
      }
    } else {
      alert(`Unrecognized QR Code: ${data}`);
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (hasPermission === null) {
    return <SafeAreaView style={styles.container} />;
  }
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      {/* Scanner Overlay UI */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <Text style={styles.scanText}>Scan Squad Pass</Text>
        </View>
        <View style={styles.middleOverlay}>
          <View style={styles.sideOverlay} />
          <View style={styles.focusedArea}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          {scanned ? (
            <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
              <Text style={styles.buttonText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.instructionText}>Align QR Code within the frame to scan</Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const overlayColor = 'rgba(0,0,0,0.6)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  scanText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  middleOverlay: {
    flexDirection: 'row',
    height: MASK_DIMENSION,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  focusedArea: {
    width: MASK_DIMENSION,
    height: MASK_DIMENSION,
    position: 'relative',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: overlayColor,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.8,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 20,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cornerTopLeft: { position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderColor: Colors.primary, borderTopWidth: 4, borderLeftWidth: 4 },
  cornerTopRight: { position: 'absolute', top: 0, right: 0, width: 30, height: 30, borderColor: Colors.primary, borderTopWidth: 4, borderRightWidth: 4 },
  cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderColor: Colors.primary, borderBottomWidth: 4, borderLeftWidth: 4 },
  cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderColor: Colors.primary, borderBottomWidth: 4, borderRightWidth: 4 },
});
