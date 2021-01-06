
const EVENT_NAMES = {
    CONNECTION: "connection",
    EXPIRED_TOKEN: "expired-token",
    REQUEST_USER_ONLINE: "request-online-user",
    RESPONSE_USER_ONLINE: "response-online-user",
    RESPONSE_USER_OFFLINE: "response-user-offline",
    SIGN_OUT: 'sign-out',
    DISCONNECT: "disconnect",
    INVITE_JOIN_MATCH: "invite-player",
    ACCEPT_INVITE: "accept-invite",
    START_GAME: "start-game",
    RESPONSE_NEW_BOARD: "new-board",
    MSG_FROM_CLIENT: "send-message",
    MSG_TO_CLIENT: "receive-message",
    STEP_FROM_CLIENT:"send-position",
    STEP_TO_CLIENT: "receive-position",
};

module.exports =  EVENT_NAMES;