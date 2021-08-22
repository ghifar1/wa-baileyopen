
import room, {rooms} from "./rooms.js";

class werewolf {
    splitLineTextGroup(linetext)
    {
        let textArr = linetext.split("-");
        return textArr;
    }

    splitLineTextPerson(linetext)
    {
        let textArr = linetext.split("@");
        return textArr;
    }

    createGame(linetext)
    {
        let res = this.splitLineTextGroup(linetext);
        try {
            room.createRoom(res[0], res[1]);
        }catch(e)
        {
            throw e;
        }

        let msg = 'Room berhasil dibuat oleh ' + res[0];
        return msg;
    }

    addPlayer(linetext)
    {
        let res = this.splitLineTextGroup(linetext);
        try {
            room.addPlayer(res[0], res[1]);
        }catch(e)
        {
            throw e;
        }
        let msg = `${res[0]} berhasil join ke dalam permainan`;
        return msg;
    }

    listPlayers(linetext)
    {
        let res = this.splitLineTextGroup(linetext);
        let msg = '';
        try {
            msg = room.listPlayers(res[1]);
            
        } catch(e)
        {
            throw e;
        }
        return msg;
    }

    showRooms()
    {
        console.log(rooms);
    }
}

export default new werewolf;