
const EVENT_NAMES = {
    CONNECTION: "connection",
    EXPIRED_TOKEN: "expired-token",
    REQUEST_USER_ONLINE: "request-online-user",
    RESPONSE_USER_ONLINE: "response-online-user",
    RESPONSE_USER_OFFLINE: "response-user-offline",
    SIGN_OUT: 'sign-out',
    DISCONNECT: "disconnect",
    REQUEST_RECONNECT: "request-reconnect",
    RESPONSE_RECONNECT: "reponse-reconnect",
    REQUEST_UPDATE_PLAYER_INFO: "request-update-user-info",
    RESPONSE_UPDATE_PLAYER_INFO: "response-update-user-info",
    RESPONSE_CURRENT_PLAYER: 'response-current-player',
    RESPONSE_STATUS: "response-status",
    INVITE_JOIN_MATCH: "invite-player",
    ACCEPT_INVITE: "accept-invite",
    JOIN_BOARD: "join-board",
    START_GAME: "start-game",
    RESPONSE_WINNER: 'response-winner',
    RESPONSE_NEW_BOARD: "new-board",
    MSG_FROM_CLIENT: "send-message",
    MSG_TO_CLIENT: "receive-message",
    STEP_FROM_CLIENT:"send-position",
    STEP_TO_CLIENT: "receive-position",
};

module.exports =  EVENT_NAMES;