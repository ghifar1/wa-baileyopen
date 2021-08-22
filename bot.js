import { MessageType, WAConnection } from '@adiwajshing/baileys'
import { io } from './socket.js';
import qr from 'qr-image';
import Bidikmisi from './modul/bidikmisi.js';
import parmad from './modul/parmad.js';
import main from './modul/werewolf/main.js';
import * as fs from 'fs';


const WAconn = [];
const AuthParmad = []

async function connect(id, socket_id)
{
    const InitBot = new WAConnection();
    InitBot.connectOptions = {
        agent: undefined,
        alwaysUseTakeover: true,
        connectCooldownMs: 4000,
        fetchAgent: undefined,
        logQR: false,
        maxIdleTimeMs: 60_000,
        maxRetries: 1,
        phoneResponseTime: 600_000,
    }

    if(process.env.SERVER == 'LOCAL' || process.env.SERVER == 'VPS')
    {
        try{
            if(fs.existsSync('./token/'+id+'.json'))
            {
                InitBot.loadAuthInfo('./token/'+id+'.json');
            } else {
                fs.writeFileSync('./token/'+id+'.json', '');
            }
        }catch(e)
        {
            console.log(e)
        }
    }
    WAconn[id] = InitBot;
    io.to(socket_id).emit('status', 'qrcode');
    InitBot.on('qr', qr_data=>{
        let buff = qr.imageSync(qr_data);
        io.to(socket_id).emit('qrcode', Buffer.from(buff).toString('base64'))
    })

    InitBot.on('open', (open) => {
        //console.log(open);
        // save credentials whenever updated
        if(process.env.SERVER == 'LOCAL' || process.env.SERVER == 'VPS')
        {
        const authInfo = InitBot.base64EncodedAuthInfo() // get all the auth info we need to restore this session
        fs.writeFileSync('./token/'+socket_id+'.json', JSON.stringify(authInfo, null, '\t')) // save this info to a file
        }
    })

    let err;
    const conres = await InitBot.connect().catch(e=>{
        err = e;
        return false;
    })

    if(!conres)
    {
        io.to(socket_id).emit('status', 'failed');
        console.error(err)
        return false;
    }

    
    

    console.log('connection success');
    io.to(socket_id).emit('status', 'success');

    InitBot.on('received-pong', async()=>{
        console.log('Pong incoming!');
    })

    InitBot.on('ws-close', res => {
        console.log('websocket close: ' + res.reason);
    })

    InitBot.on('close', res => {
        console.log('connection close: ' + res.reason + ' reconnecting? ' + res.isReconnecting);
    })

    InitBot.on('connection-phone-change', res => {
        console.log('connection change: ' + res.connected);
    })

    //static bot
    InitBot.on('chat-update', async chatUpdate => {
        // `chatUpdate` is a partial object, containing the updated properties of the chat
        // received a new message
        if (chatUpdate.messages && chatUpdate.count) {
            const message = chatUpdate.messages.all()[0]
            console.log (message);
            console.log (message.key.remoteJid);
            var conv = message.message.conversation;

            if(conv.includes("/getid"))
            {
                var msg = id;
                await InitBot.chatRead(message.key.remoteJid);
                await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
            }

            if(conv === "/bidikmisi")
            {
                var msg = '*-- Cek Pencairan Bidikmisi --*\n\n' +
                'Untuk mengecek status pencairan bidikmisi kamu, ketik:\n' +
                '/bidikmisi/cek/(NIM)/(Nomor Rekening)\n' +
                'Contoh: /bidikmisi/cek/11910xxx/00140xxxx\n\n' +
                '*Fitur ini hanya berlaku bagi mahasiswa Paramadina.'

                await InitBot.chatRead(message.key.remoteJid);
                await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
            }

            if(conv.includes("/bidikmisi/cek"))
            {
                var linetext = message.message.conversation;
                await InitBot.chatRead(message.key.remoteJid);
                await InitBot.sendMessage(message.key.remoteJid, "Sedang mengecek, harap tunggu...", MessageType.text);
                const bm = new Bidikmisi();
                try {
                    var hasil = await bm.result(linetext);
                    await InitBot.sendMessage(message.key.remoteJid, hasil, MessageType.text);
                    //console.log(hasil);
                }catch(e)
                {
                    console.error(e)
                }
            }

            if(conv === "/cekauth")
            {
                let auth = AuthParmad[message.key.remoteJid];
                await InitBot.chatRead(message.key.remoteJid);
                let msg ='';
                if (typeof auth == 'undefined')
                {
                    msg = 'Tidak ada sesi login.';
                } else {
                    msg = 'Sesi sedang login';
                }
                await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
            }

            if(conv.includes("/login"))
            {
                await InitBot.chatRead(message.key.remoteJid);
                await InitBot.sendMessage(message.key.remoteJid, 'Sedang login...', MessageType.text);
                try {
                    let msg = await parmad.login(conv, message.key.remoteJid);
                    await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
                }catch(e)
                {
                    let msg = e;
                    await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
                }
            }

            if(conv.includes("/getsemester"))
            {
                await InitBot.chatRead(message.key.remoteJid);
                try {
                    let msg = await parmad.getSemester(conv, message.key.remoteJid);
                    console.log(msg);
                    await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
                }catch(e)
                {
                    let msg = e;
                    console.log(msg);
                    await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
                }
            }

            if(conv.includes("/getkhs"))
            {
                await InitBot.chatRead(message.key.remoteJid);
                try{
                    let msg = await parmad.getKhs(conv, message.key.remoteJid);
                    await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
                }catch(e)
                {
                    let msg = e;
                    await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
                }
            }

            if(conv == "/werewolf" && message.participant)
            {
                await InitBot.chatRead(message.key.remoteJid);
                let msg = '--------------------- \n';
                msg += '🐺 Werewolf Game 🐺 \n';
                msg += '--------------------- \n';
                msg += 'Untuk bermain werewolf, ketik /werewolf/buat';
                await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
            }

            if(conv.includes("/werewolf/buat") && message.participant)
            {
                await InitBot.chatRead(message.key.remoteJid);
                try {
                    let msg = main.createGame(message.key.remoteJid);
                    await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
                }catch(e)
                {
                    console.log(e);
                    let msg = e.message;
                    await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
                }
                
            }

            if(conv.includes("/werewolf/room") && message.participant)
            {
                await InitBot.chatRead(message.key.remoteJid);
                main.showRooms();
            }

            if(conv.includes("/werewolf/pemain") && message.participant)
            {
                await InitBot.chatRead(message.key.remoteJid);
                let msg = ''
                try {
                    msg = main.listPlayers(message.key.remoteJid);
                    
                }catch(e)
                {
                    msg = e.message;
                }
                await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
            }

            if(conv.includes("/werewolf/join") && message.participant)
            {
                await InitBot.chatRead(message.key.remoteJid);
                let msg = '';
                try {
                    msg = main.addPlayer(message.key.remoteJid);
                    await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
                }catch(e)
                {
                    msg = e.message;
                    await InitBot.sendMessage(message.key.remoteJid, msg, MessageType.text);
                }
                
            }


        } else console.log (chatUpdate) // see updates (can be archived, pinned etc.)
    })
}

async function sendText(id,number, message)
{
    if(!WAconn[id])
    {
        return Promise.reject('id not found');
    }

    if(!message)
    {
        return Promise.reject('message null');
    }

    const exist = await WAconn[id].isOnWhatsApp(number);
    if(!exist)
    {
        return Promise.reject('number not found')
    }
    await WAconn[id].sendMessage(number+'@s.whatsapp.net', message, MessageType.text);
    return "success"

}



export {connect, sendText, AuthParmad};

