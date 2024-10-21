// src/utils/uploadImage.ts
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase"; // Adjust this import based on your project structure

export const uploadImage = async (uri: string, eventId: string): Promise<string> => {
  // Convert image URI to blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  // Create a reference for the image in storage
  const fileRef = ref(storage, `images/events/${eventId}/image_${Date.now()}.jpg`); // Unique path for each event
  await uploadBytesResumable(fileRef, blob);

  // Get the download URL of the uploaded image
  const downloadURL = await getDownloadURL(fileRef);
  
  return downloadURL; // Return the download URL
};
