const io = require('socket.io')(3000)

const rooms = {}
const users = {}
io.on('connection', socket => {
  var token = ""
  socket.on('new-user', user => {
    token = user.token
    if (!rooms.hasOwnProperty(token) && user.user == 'supporter')
    {
      rooms[token] = {}
    }
    if (rooms.hasOwnProperty(token))
    {
      rooms[token][socket.id] = user.user
      console.log(Object.keys(rooms[token]).length)
    }
    if (!rooms.hasOwnProperty(token) && user.user != 'supporter')
    {
      var destination = './brokenLink.html'
      socket.emit('redirect', destination);
      socket.disconnect()
    }
    if (rooms.hasOwnProperty(token))
    if(Object.keys(rooms[token]).length > 2)
    {
      rooms[token][socket.id] = ""
      var destination = './chatRoomFull.html'
      socket.emit('redirect', destination);
      socket.disconnect()
    }
    else
    {
      socket.broadcast.to(token).emit('user-connected', user.user)
      socket.join(token)
    }
  })
  socket.on('send-chat-message', message => {
    socket.broadcast.to(token).emit('chat-message', { message: message, name: rooms[token][socket.id] })
  })
  socket.on('disconnect', () => {
    if (rooms.hasOwnProperty(token))
    if (rooms[token][socket.id] != "")
    socket.broadcast.to(token).emit('user-disconnected', rooms[token][socket.id])
    if (rooms.hasOwnProperty(token))
    delete rooms[token][socket.id]
  })
})