
const Discord = require("discord.js")
const client = new Discord.Client();
const auth = require("./token.json")

class Player {
    constructor(playerId, playerName) {
        this.name = playerName;
        this.id = playerId;
    }
}

let gamestatus = 0;
let lobby = [];
let test = [];

client.on("message", msg => {

    


        if (msg.content === "!avalon") {
            if (gamestatus === 0) {
                msg.channel.send("A game has started! \nUse !join to enter the lobby!\nUse !start to begin the game")
                gamestatus = 1
                
                addPlayer(msg.member.user.username, msg.member.id);
               
                showLobby();

            } else {
                msg.reply("A game has already started!\nJoin the current game or wait for it to end!")
            }
        } else if (msg.content === "!join") {
            addPlayer(msg.member.user.username, msg.member.id);
            msg.reply("You have joined the lobby!");
            //showLobby();
        } else if (msg.content === "!showlobby") {
            showLobby();
        }

        function showLobby() {
            msg.channel.send("====================================\nLobby\n====================================\n")
            
            for (let i = 0; i < lobby.length; i++) {
                //msg.channel.send(test);
                msg.channel.send(lobby[i].name +"\n");
            }
        }
      
})

function addPlayer(playerName, playerId) {
    let player = new Player(playerId, playerName);
    lobby.push(player)
 
}




client.login(auth.token)
