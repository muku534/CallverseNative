import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper function to store data in AsyncStorage
export const storeDataInAsyncStorage = async (key, data) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to AsyncStorage`, error);
    }
};


// Helper function to retrieve data from AsyncStorage
export const retrieveDataFromAsyncStorage = async (key) => {
    try {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error retrieving ${key} from AsyncStorage`, error);
        return null;
    }
};