
const Discord = require("discord.js")
const client = new Discord.Client();
const auth = require("./token.json")

class Player {
    constructor(playerId, playerName, user) { 
        this.roleOfPlayer = 0; 
        this.isPartyLeader = 0;
        this.name = playerName;
        this.id = playerId;
        this.user = user
       
    }
} 


let gamestatus = 0;
let lobby = [];

let amtEvil = 0;
let roundHistory = [];
let playersNeededForQuest = [];
let currentRound = 0;
let needTwoFails;
let successes = 0;
let fails = 0;


client.on("message", msg => {

   // let messengerName = msg.member.user.username;

        if (msg.content === "!avalon") {
            if (gamestatus === 0) {
                msg.channel.send("A lobby has been created! \nUse !join to enter the lobby!\nUse !start to begin the game")
                gamestatus = 1;
                
                addPlayer( msg.member.user.username, msg.member.id, showLobby, msg.member.user);
               

            } else {
                msg.reply("A game has already started!\nJoin the current game or wait for it to end!")
            }

            // TODO: MAKE SURE THAT A USER CAN NOT JOIN TWICE OR MORE
        } else if (msg.content === "!join" && gamestatus === 1) {
            msg.reply("You have joined the lobby!");
            addPlayer( msg.member.user.username, msg.member.id, showLobby, msg.member.user);   
           
        } else if (msg.content === "!showlobby") {
            showLobby();

        } else if (msg.content === "!quit" && gamestatus === 1) {
            let temp = checkName(msg.member.user.username);
            if (temp !== -1) {
                removePlayer(temp);
                msg.reply("you have been removed from the lobby!")
            } else {
                msg.reply("You are not in the lobby!");
            }

        } else if (msg.content === "!start") {
            let numPlayers = lobby.length;
            if (numPlayers < 5 || numPlayers >= 10) {
                msg.channel.send("You need 5-10 players for a game!")
            } else {
                // game start/inital round
                gamestatus = 2;
                // setting up the game
                switch(numPlayers) {
                    case 5:
                        amtEvil = 2;
                        playersNeededForQuest = [2,3,2,3,3];
                        break;
                    case 6:
                        amtEvil = 2;
                        playersNeededForQuest = [2,3,4,3,4];
                        break;
                    case 7:
                        amtEvil = 3;
                        playersNeededForQuest = [2,3,3,4,4];
                        needTwoFails = 1;
                        break;
                    case 8:
                        amtEvil = 3;
                        playersNeededForQuest = [3,4,4,5,5];
                        needTwoFails = 1;
                        break;
                    case 9:
                       amtEvil = 3;
                       playersNeededForQuest = [3,4,4,5,5];
                       needTwoFails = 1;
                       break;
                    case 10:
                         amtEvil = 4;
                         playersNeededForQuest = [3,4,4,5,5];
                         needTwoFails = 1;
                         break;
                }

                // assign evil roles and party leader (random)
                msg.channel.send("The game has started!");
                let evilMessage = "";
                let i = 0;
                while (i < amtEvil) {
                    let evil = Math.floor(Math.random() * (numPlayers) + 1 )
                        
                    if (lobby[evil].roleOfPlayer === 1) {
                            continue;
                    } else {
                        lobby[evil].roleOfPlayer = 1;
                        evilMessage += lobby[evil].name + ", ";
                        i++;
                    }
                }
                
                evilMessage += "are evil!";

                for (let i = 0; i < lobby.length; i++) {
                    if (lobby[i].roleOfPlayer === 1) {
                        lobby[i].user.send(evilMessage);
                    }
                }

                let partyLeader = Math.floor(Math.random() * (numPlayers) + 1);
                lobby[partyLeader].isPartyLeader = 1;
                msg.channel.send("<@" +lobby[partyLeader].id + "> is the party leader!");
                



            }
        }


        function showLobby() {
            msg.channel.send("====================================\nLobby\n====================================\n")

            let temp = "";
            
            for (let i = 0; i < lobby.length; i++) {
               temp += lobby[i].name + "\n";
            }
            msg.channel.send(temp);
        }
});



function addPlayer(playerName, playerId, callback, user) {
    let player = new Player(playerId, playerName, user);
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
