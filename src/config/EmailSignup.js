import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export const EmailSignup = async ({ email, password, name, randomNumber, selectedImage }) => {
    try {
        // Create user with email and password
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);

        // Extract user UID from userCredential
        const { uid } = userCredential.user;

        let downloadURL = '';

        if (selectedImage) {
            // Create a reference to the file you want to upload
            const fileName = selectedImage.split('/').pop();
            const storageRef = storage().ref(`profileImages/${fileName}`);

            // Upload the file to Firebase Storage
            await storageRef.putFile(selectedImage);

            // Get the download URL of the uploaded file
            downloadURL = await storageRef.getDownloadURL();
        } else {
            // Use default image URL when no image is selected
            downloadURL = 'https://firebasestorage.googleapis.com/v0/b/callverse-b7cb4.appspot.com/o/user-3.png?alt=media&token=5f78f05a-99fb-47dd-b8fc-7ec4970bfba4';
        }


        // Prepare user data to be stored in Firestore
        const userData = {
            id: uid,
            displayName: name, // Set displayName here
            email: email,
            photoUrl: downloadURL,
            randomNumber: randomNumber,
            createdAt: firestore.FieldValue.serverTimestamp()
        };

        // Store user data in Firestore under 'users' collection with UID as document ID
        await firestore().collection('Users').doc(uid).set(userData);

        // Store user data in AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(userData));

        console.log('User account created & signed in!');
        return userCredential.user; // Return the user data

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('That email address is already in use!');
        } else if (error.code === 'auth/invalid-email') {
            console.log('That email address is invalid!');
        } else {
            console.error(error);
        }
        return null;
    }
};

export const EmailSignin = async ({ email, password }) => {
    try {
        await auth().signInWithEmailAndPassword(email, password);
        const currentUser = auth().currentUser;

        if (currentUser) {
            const userDoc = await firestore().collection('Users').doc(currentUser.uid).get();
            const userData = userDoc.data();

            if (userData) {
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
            }

            console.log('User Signed in!');
            return currentUser;
        }
    } catch (error) {
        if (error.code === 'auth/invalid-email') {
            console.log('That email address is invalid!');
        } else {
            console.error(error);
        }
    }
};
