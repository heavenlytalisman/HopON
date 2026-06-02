const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwulqwvlx';
export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
export const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'hopon_media';

/**
 * Uploads a local image URI to Cloudinary via their unauthenticated REST API.
 * @param imageUri Local file URI (e.g. from expo-image-picker)
 * @returns The secure URL of the uploaded image on Cloudinary
 */
export const uploadToCloudinary = async (imageUri: string): Promise<string> => {
  try {
    const data = new FormData();
    
    // React Native's FormData requires this specific shape for files
    data.append('file', {
      uri: imageUri,
      type: 'image/jpeg', // Cloudinary will automatically detect and optimize the real type
      name: `hopon_media_${Date.now()}.jpg`,
    } as any);
    
    data.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      }
    });

    const result = await response.json();
    
    if (result.secure_url) {
      return result.secure_url;
    } else {
      throw new Error(result.error?.message || 'Failed to upload image to Cloudinary');
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
