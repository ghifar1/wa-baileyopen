import {Server} from 'socket.io';
import { httpServer } from './route.js';

const io = new Server(httpServer);

io.on('connection', socket=>{
    console.log('new client connected: '+socket.id)
})

export {io};