const rooms = {};

class Room {
    checkRoom(groupId)
    {
        if(rooms[groupId])
        {
            return true;
        } else {
            return false;
        }
        
    }

    createRoom(userId, groupId)
    {
        let check = this.checkRoom(groupId);
        if(check)
        {
            throw new Error('⛔[ERROR] Room untuk grup sudah dibuat oleh ' + rooms[groupId].created_by);
        }
        // if(rooms[groupId])
        // {
        //     throw new Error('⛔[ERROR] Room untuk grup sudah dibuat oleh ' + rooms[groupId].created_by);
        // }
        let date = new Date().getTime();
        let newRoom = {
            created_by: userId,
            created_at: date,
            players: [],
        }
        newRoom.players.push(userId);
        rooms[groupId] = newRoom;
        return "OK";
    }

    addPlayer(userId, groupId)
    {
        let check = this.checkRoom(groupId);
        if(!check)
        {
            throw new Error('⛔[ERROR] Room belum dibuat!');
        }
        let listPlay = rooms[groupId].players;
        if(listPlay.includes(userId))
        {
            throw new Error('⛔[ERROR] '+userId+' sudah join ke dalam game!');
        }
        rooms[groupId].players.push(userId);
        return "OK";
    }

    listPlayers(groupId)
    {
        let check = this.checkRoom(groupId);
        if(!check)
        {
            throw new Error('⛔[ERROR] Room belum dibuat!');
        }

        let arr = rooms[groupId].players;
        let msg = '';
        msg += 'List pemain: \n';
        let iter = 1;
        arr.forEach(player => {
            msg += `${iter}. ${player}`;
            iter++;
        });

        return msg;
    }

    removeRoom(groupId)
    {
        rooms[groupId] = undefined;
        return "OK";
    }
}

export default new Room;
export {
    rooms
}