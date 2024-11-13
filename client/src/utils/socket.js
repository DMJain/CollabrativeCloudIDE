import {io} from 'socket.io-client';

const socket = io("http://localhost:1000/");

export default socket;