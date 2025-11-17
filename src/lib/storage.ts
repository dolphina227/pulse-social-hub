// Image upload utility - uploads to IPFS via web3.storage or similar
export async function uploadImage(file: File): Promise<string> {
  try {
    // For now, we'll use a simple base64 data URL approach
    // In production, replace this with IPFS, Pinata, or Web3.Storage
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export function validateImageFile(file: File): boolean {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload PNG, JPEG, or WebP.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }
  
  return true;
}
