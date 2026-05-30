import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, PanResponder, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - Spacing.xl * 2;
const THUMB_SIZE = 24;

export default function SquadWallpaperScreen({ route, navigation }: RootStackScreenProps<'SquadWallpaper'>) {
  const { squadId, squadWallpaper: initialWallpaper, wallpaperOpacity: initialOpacity = 0.6 } = route.params;

  const [squadWallpaper, setSquadWallpaper] = useState<string | null>(initialWallpaper || null);
  const [opacity, setOpacity] = useState<number>(initialOpacity);
  
  const handlePickWallpaper = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSquadWallpaper(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    navigation.navigate({
      name: 'SquadEdit',
      params: { squadId, squadName: 'Unknown', squadWallpaper: squadWallpaper || undefined, wallpaperOpacity: opacity },
      merge: true,
    });
  };



  // Let's implement a robust custom slider without PanResponder state headaches by just using an absolute position tracking
  const [sliderStartX, setSliderStartX] = useState(0);

  const customSliderPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        // Calculate initial percentage based on touch location
        const touchX = e.nativeEvent.locationX;
        let newOpacity = touchX / SLIDER_WIDTH;
        newOpacity = Math.max(0, Math.min(newOpacity, 1));
        setOpacity(newOpacity);
      },
      onPanResponderMove: (e, gestureState) => {
        // Not perfect without knowing start thumb position, but standard PanResponder over a View works best if we use pageX
        const pageX = e.nativeEvent.pageX;
        // Assume padding is Spacing.xl (24) on the left
        const leftPadding = Spacing.xl;
        let newX = pageX - leftPadding;
        let newOpacity = newX / SLIDER_WIDTH;
        newOpacity = Math.max(0, Math.min(newOpacity, 1));
        setOpacity(newOpacity);
      }
    })
  ).current;


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBtnTextCancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Wallpaper</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleSave}>
          <Text style={styles.headerBtnTextSave}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.previewContainer}>
        {squadWallpaper ? (
          <Image source={{ uri: squadWallpaper }} style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="image-outline" size={48} color={Colors.border} />
            <Text style={{ color: Colors.textMuted, marginTop: 8 }}>No Wallpaper Selected</Text>
          </View>
        )}
        
        {/* Dark Overlay */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: `rgba(11, 13, 23, ${opacity})` }]} />
        
        {/* Mock Chat Content for Preview */}
        <View style={styles.mockChat}>
          <View style={styles.mockBubbleLeft}>
            <Text style={styles.mockText}>How does this background look?</Text>
          </View>
          <View style={styles.mockBubbleRight}>
            <Text style={styles.mockTextRight}>Looks incredibly sleek! 🔥</Text>
          </View>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.uploadBtn} onPress={handlePickWallpaper}>
          <Ionicons name="camera-outline" size={20} color={Colors.primaryLight} style={{ marginRight: 8 }} />
          <Text style={styles.uploadBtnText}>{squadWallpaper ? 'Change Wallpaper' : 'Choose Wallpaper'}</Text>
        </TouchableOpacity>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Dark Overlay Transparency</Text>
            <Text style={styles.sliderValue}>{Math.round(opacity * 100)}%</Text>
          </View>
          
          <View 
            style={styles.sliderTrackContainer} 
            {...customSliderPan.panHandlers}
          >
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${opacity * 100}%` }]} />
            </View>
            <View style={[styles.sliderThumb, { left: opacity * SLIDER_WIDTH - THUMB_SIZE / 2 }]} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: {
    minWidth: 60,
    justifyContent: 'center',
  },
  headerBtnTextCancel: {
    color: Colors.textMuted,
    fontSize: FontSizes.md,
  },
  headerBtnTextSave: {
    color: Colors.primaryLight,
    fontSize: FontSizes.md,
    fontWeight: '700',
    textAlign: 'right',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.base,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  previewContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    justifyContent: 'flex-end',
    padding: Spacing.lg,
  },
  mockChat: {
    width: '100%',
  },
  mockBubbleLeft: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  mockBubbleRight: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  mockText: {
    color: Colors.textPrimary,
    fontSize: 15,
  },
  mockTextRight: {
    color: '#FFF',
    fontSize: 15,
  },
  controlsContainer: {
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xxxl,
    backgroundColor: Colors.surface,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  uploadBtnText: {
    color: Colors.primaryLight,
    fontWeight: '700',
    fontSize: 15,
  },
  sliderSection: {
    marginTop: Spacing.md,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sliderLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  sliderValue: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
  sliderTrackContainer: {
    height: THUMB_SIZE,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: Colors.primaryLight,
  },
  sliderThumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
