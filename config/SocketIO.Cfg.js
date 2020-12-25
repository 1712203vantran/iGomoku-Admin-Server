
const EVENT_NAMES = {
    CONNECTION: "connection",
    REQUEST_USER_LIST: "request-list-online-user",
    RESPONSE_USER_LIST: "response-list-online-user",
    SIGN_OUT: 'sign-out',
    DISCONNECT: "disconnect",
    INVITE_JOIN_MATCH: "invite_player",
    ACCEPT_INVITE: "accept_invite",
    START_GAME: "start_game",
    MSG_FROM_CLIENT: "send_message",
    MSG_TO_CLIENT: "receive_message",
    STEP_FROM_CLIENT:"send_position",
    STEP_TO_CLIENT: "receive_position",
};

module.exports =  EVENT_NAMES;