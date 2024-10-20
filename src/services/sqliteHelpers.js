import SQLite from 'react-native-sqlite-storage';

// Open the database connection
const DB = SQLite.openDatabase({ name: "CallverseDB", location: 'default' });

// Initialize the database: Create tables if they don't already exist
export const initializeDatabase = () => {
    DB.transaction(tx => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS User (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                photoUrl TEXT,
                phone TEXT NOT NULL,
                fcmToken TEXT
            );`
        );
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS Contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                photoUrl TEXT
            );`
        );
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ChatRooms (
                id TEXT PRIMARY KEY,
                archived INTEGER DEFAULT 0
            );`
        );
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS Messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chatRoomId TEXT NOT NULL,
                senderId TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );`
        );
    });
};

// Store a user in the SQLite database
export const storeUserInSQLite = (user) => {
    return new Promise((resolve, reject) => {
        DB.transaction(tx => {
            tx.executeSql(
                `INSERT OR REPLACE INTO User (id, name, email, photoUrl, phone, fcmToken)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [user.id, user.name, user.email, user.photoUrl, user.phone, user.fcmToken],
                () => resolve(user),
                (_, error) => reject(error)
            );
        });
    });
};

// Fetch a user from the SQLite database by ID
export const getUserFromSQLite = (id) => {
    return new Promise((resolve, reject) => {
        DB.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM User WHERE id = ?;',
                [id],
                (_, { rows }) => resolve(rows.length ? rows.item(0) : null),
                (_, error) => reject(error)
            );
        });
    });
};

// Store a contact in the SQLite database
export const storeContactInSQLite = (contact) => {
    return new Promise((resolve, reject) => {
        DB.transaction(tx => {
            tx.executeSql(
                `INSERT INTO Contacts (name, email, phone, photoUrl)
                VALUES (?, ?, ?, ?)`,
                [contact.name, contact.email, contact.phone, contact.photoUrl],
                (_, result) => resolve(result),
                (_, error) => reject(error)
            );
        });
    });
};

// Fetch all contacts from the SQLite database
export const getContactsFromSQLite = () => {
    return new Promise((resolve, reject) => {
        DB.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM Contacts;',
                [],
                (_, { rows }) => resolve(rows.raw()),
                (_, error) => reject(error)
            );
        });
    });
};

// Store a chat room in the SQLite database
export const storeChatRoomInSQLite = (chatRoom) => {
    return new Promise((resolve, reject) => {
        DB.transaction(tx => {
            tx.executeSql(
                `INSERT OR REPLACE INTO ChatRooms (id, archived) 
                VALUES (?, ?)`,
                [chatRoom.id, chatRoom.archived ? 1 : 0],
                (_, result) => resolve(result),
                (_, error) => reject(error)
            );
        });
    });
};

// Fetch all chat rooms from the SQLite database
export const getChatRoomsFromSQLite = () => {
    return new Promise((resolve, reject) => {
        DB.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM ChatRooms;',
                [],
                (_, { rows }) => resolve(rows.raw()),
                (_, error) => reject(error)
            );
        });
    });
};

// Store a message in the SQLite database
export const storeMessage = (message) => {
    return new Promise((resolve, reject) => {
        DB.transaction(tx => {
            tx.executeSql(
                `INSERT INTO Messages (chatRoomId, senderId, content) 
                VALUES (?, ?, ?)`,
                [message.chatRoomId, message.senderId, message.content],
                (_, result) => resolve(result),
                (_, error) => reject(error)
            );
        });
    });
};

// Fetch messages for a specific chat room from the SQLite database
export const fetchMessages = (chatRoomId) => {
    return new Promise((resolve, reject) => {
        DB.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM Messages WHERE chatRoomId = ? ORDER BY timestamp ASC;',
                [chatRoomId],
                (_, { rows }) => resolve(rows.raw()),
                (_, error) => reject(error)
            );
        });
    });
};
