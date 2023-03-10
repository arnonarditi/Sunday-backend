const logger = require('./logger.service')

var gIo = null

function setupSocketAPI(http) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        logger.info(`New connected socket [id: ${socket.id}]`)
        socket.on('disconnect', socket => {
            logger.info(`Socket disconnected [id: ${socket.id}]`)
        })
        socket.on('chat-set-topic', topic => {
            if (socket.myTopic === topic) return
            if (socket.myTopic) {
                
                socket.leave(socket.myTopic)
                logger.info(`Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`)
            }
            socket.join(topic)
            socket.myTopic = topic
        })
        socket.on('chat-send-comments', comments => {
            logger.info(`New chat comments from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`)
            // emits only to sockets in the same room
            gIo.to(socket.myTopic).emit('chat-add-comments', comments)
        })

    })
}

function emitTo({ type, data, topic }) {
    if (topic) gIo.to(topic).emit(type, data)
    else gIo.emit(type, data)
}


module.exports = {
    // set up the sockets service and define the API
    setupSocketAPI,
    // emit to everyone / everyone in a specific room (topic)
    emitTo, 
}
