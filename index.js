
const Discord = require("discord.js")
const client = new Discord.Client();
const auth = require("./token.json")

class Player {
    constructor(playerId, playerName) {
        this.name = playerName;
        this.id = playerId;
        this.role = 0;
    }
}

let gamestatus = 0;
let lobby = [];


client.on("message", msg => {

    let messengerName = msg.member.user.username;

        if (msg.content === "!avalon") {
            if (gamestatus === 0) {
                msg.channel.send("A game has started! \nUse !join to enter the lobby!\nUse !start to begin the game")
                gamestatus = 1
                
                addPlayer(messengerName, msg.member.id, showLobby);
               

            } else {
                msg.reply("A game has already started!\nJoin the current game or wait for it to end!")
            }
            
        } else if (msg.content === "!join") {
            msg.reply("You have joined the lobby!");
            addPlayer(messengerName, msg.member.id, showLobby);   
           
        } else if (msg.content === "!showlobby") {
            showLobby();

        } else if (msg.content === "!quit") {
            let temp = checkName(messengerName);
            if (temp !== -1) {
                removePlayer(temp);
                msg.reply("you have been removed from the lobby!")
            } else 
                msg.reply("You are not in the lobby!");
        }

        function showLobby() {
            msg.channel.send("====================================\nLobby\n====================================\n")

            let temp = "";
            
            for (let i = 0; i < lobby.length; i++) {
                //msg.channel.send(test);
               temp += lobby[i].name + "\n";
            }
            msg.channel.send(temp);
        }
      
})

function addPlayer(playerName, playerId, callback) {
    let player = new Player(playerId, playerName);
    lobby.push(player)
    callback();
 
}

function removePlayer(player) {
    let num = lobby.indexOf(player)
    if (num > -1) {
      lobby.splice(num, 1);  
    }
}

function checkName(name) {
    for (let i = 0; i < lobby.length; i++) {
        if (lobby[i].name === name) {
            return lobby[i];
        }
    }
    return -1;
}



client.login(auth.token)
