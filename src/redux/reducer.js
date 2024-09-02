import {
    ADD_CHATS, ADD_CONTACTS, DELETE_CONTACTS, FETCH_CHATS,
    FETCH_CHATSROOM,
    FETCH_CONTACTS, LOGIN, LOGOUT, REMOVE_CHAT, SIGNUP,
    UPDATE_CHAT_ROOM
} from "./action";


const initialState = {
    userData: null,
    contacts: [],
    chats: [],
    chatRoom: [],
    error: null
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case SIGNUP:
        case LOGIN:
            return {
                ...state,
                userData: action.payload.userData,
                error: null
            };
        case FETCH_CONTACTS:
            return {
                ...state,
                contacts: action.payload.contacts,
                error: null
            };
        case ADD_CONTACTS:
            return {
                ...state,
                contacts: [...state.contacts, action.payload.contacts],
                error: null
            };
        case DELETE_CONTACTS:
            return {
                ...state,
                contacts: state.contacts.filter(contact => contact.id !== action.payload.id),
                error: null
            };
        case FETCH_CHATS:
            return {
                ...state,
                chats: action.payload.chats,
                error: null
            };
        case FETCH_CHATSROOM:
            return {
                ...state,
                chatRoom: action.payload.chatRoom,
                error: null
            };

        case UPDATE_CHAT_ROOM:
            return {
                ...state,
                chatRoom: state.chatRoom.map(chat =>
                    action.payload.find(updatedChat => updatedChat.id === chat.id) || chat
                ),
            };

        case ADD_CHATS:
            return {
                ...state,
                chatRoom: [...state.chatRoom, action.payload.chatRoom],
                error: null
            };

        case REMOVE_CHAT:
            return {
                ...state,
                chats: state.chats.filter(chat => chat.id !== action.payload.id),
                error: null
            };
        case LOGOUT:
            return initialState;

        default: return state;

    }
}

export default rootReducer;
