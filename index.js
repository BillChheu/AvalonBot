const Discord = require("discord.js")
const client = new Discord.Client();

let gamestatus = 0;
let lobby = [];

client.on("message", msg => {

        if (msg.content === "Hello") {
            msg.channel.send("World!")
        }

        if (msg.content === "!avalon") {
            if (gamestatus === 0) {
                msg.channel.send("A game has started! \nUse !join to enter the lobby!\nUse !start to initiate the game")
                gamestatus = 1
                
            } else {
                msg.reply("A game has already started!\nJoin the current game or wait for it to end!")
            }
        } else if (msg.content === "!end") {
            
        }
      
})

function addPlayer(player) {
    lobby.push(player)
}






client.login("NzIwMDAzNjQ3NzgxNDcwMzMw.Xt_uuQ.MkhAtbOZO1sZxUcU0_VxtpMgS_g")