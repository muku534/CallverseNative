// Authentication/Account Management
export const LOGIN = 'LOGIN';
export const SIGNUP = 'SIGNUP';
export const LOGOUT = 'LOGOUT';
export const UPDATE_PROFILE = 'UPDATE_PROFILE';
export const FORGOT_PASSWORD = 'FORGOT_PASSWORD';
export const RESET_PASSWORD = 'RESET_PASSWORD';
export const FETCH_CONTACTS = 'FETCH_CONTACTS';
export const ADD_CONTACTS = 'ADD_CONTACTS';
export const DELETE_CONTACTS = 'DELETE_CONTACTS';
export const FETCH_CHATS = 'FETCH_CHATS';
export const ADD_CHATS = 'ADD_CHATS';
export const REMOVE_CHAT = 'REMOVE_CHAT';


// Authentication/Account Management
export const signup = (userData) => ({
    type: SIGNUP,
    payload: { userData },
});

export const loginUser = (userData) => ({
    type: LOGIN,
    payload: { userData },
});

export const logout = () => ({
    type: LOGOUT,
});

export const updateProfile = (updatedData) => ({
    type: UPDATE_PROFILE,
    payload: { updatedData },
});

export const forgotPassword = (email) => ({
    type: FORGOT_PASSWORD,
    payload: { email },
});

export const resetPassword = (token, newPassword) => ({
    type: RESET_PASSWORD,
    payload: { token, newPassword },
});

export const fetchContacts = (contacts) => ({
    type: FETCH_CONTACTS,
    payload: { contacts }
});

export const addContact = (contacts) => ({
    type: ADD_CONTACTS,
    payload: { contacts }
});

export const deleteContact = (contacts) => ({
    type: DELETE_CONTACTS,
    payload: { contacts }
});

export const fetchChats = (chats) => ({
    type: FETCH_CHATS,
    payload: { chats }
});

export const addChats = (chats) => ({
    type: ADD_CHATS,
    payload: { chats }
});

export const deleteChat = (chats) => ({
    type: REMOVE_CHAT,
    payload: { chats }
});
