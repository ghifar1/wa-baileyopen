import express from 'express';
import {createServer} from 'http';
import { fileURLToPath } from 'url';
import path,{ dirname } from 'path';
import { connect, sendText } from './bot.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);
app.use(express.json());
app.use(express.static('public'));

//middleware
function middleware(req, res, next)
{
    var auth = req.header('Authorization')
    if(!auth || auth != process.env.AUTHORIZATION)
    {
        res.status(400).json({'status': 'failed'})
    }
    if(!req.body.user_id)
    {
        return res.status(400).json({status: 'error'});
    }
    next();
}

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname+'/html/index.html'));
});

app.post('/create', async (req, res)=>{
    if(!req.body.password || req.body.password != process.env.PASS)
    {
        return res.status(401).json({desc: 'Unauthorized'});
    }
    await connect(req.body.user_id, req.body.socket_id).catch(err => console.log(err));
    return res.status(200).json({status: 'success'});
});

app.post('/sendText', middleware, (req,res)=>{
    sendText(req.body.user_id, req.body.number, req.body.message).catch(err=>{
        console.log(err);
    })
    return res.status(200).json({status: "OK"});
})

httpServer.listen(port, ()=>{
    console.log(`Example app listening at http://localhost:${port}`)
})

export {httpServer};