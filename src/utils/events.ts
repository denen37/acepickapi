export const Emit = {
    RECV_MSG: 'receive_message',
    RECV_MSGs: "receive_messages",
    ALL_CONTACTS: "all_contacts",
    JOINED_ROOM: "joined_room",
    GOT_PREV_CHATS: "got_previous_chats",
    RECV_FILE: "receive_file",
    CONNECTED: "connected",
    //notifications
    JOB_UPDATED: "JOB_UPDATED",
    JOB_CREATED: "JOB_CREATED",
    JOB_RESPONSE: "JOB_RESPONSE",
    INVOICE_GENERATED: "INVOICE_GENERATED",
    INVOICE_UPDATED: "INVOICE_UPDATED",
    JOB_COMPLETED: "JOB_COMPLETED",
    JOB_APPROVED: "JOB_APPROVED",
    JOB_DISPUTED: "JOB_DISPUTED",
    JOB_CANCELLED: "JOB_CANCELLED",
    PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
}

export const Listen = {
    SEND_MSG: 'send_message',
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    GET_CONTACTS: "get_contacts",
    JOIN_ROOM: "join_room",
    GET_MSGs: "get_messages",
    PREV_CHATS: "previous_chats",
    UPLOAD_FILE: "upload_file"
}