
const Discord = require("discord.js")
const client = new Discord.Client();
const auth = require("./token.json")

class Player {
    constructor(playerId, playerName, user) { 
        this.roleOfPlayer = 0; 
        //this.isPartyLeader = 0;
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
let playersOnQuest = [];
let partyLeader;


client.on("message", msg => {

    if (msg.author.bot)
        return;

   // let messengerName = msg.member.user.username;

        if (msg.content === "!avalon") {
            if (gamestatus === 0) {
                msg.channel.send("A lobby has been created! \nUse !join to enter the lobby!\nUse !start to begin the game")
                gamestatus = 1;
                
                addPlayer( msg.member.user.username, msg.member.id, msg.member.user);
                showPlayers(msg, lobby, "Lobby");
               

            } else {
                msg.reply("A game has already started!\nJoin the current game or wait for it to end!")
            }

            // TODO: MAKE SURE THAT A USER CAN NOT JOIN TWICE OR MORE
        } else if (msg.content === "!join" && gamestatus === 1) {
            msg.reply("You have joined the lobby!");
            addPlayer( msg.member.user.username, msg.member.id, msg.member.user);
            showPlayers(msg, lobby, "Lobby");  
           
        } else if (msg.content === "!showlobby") {
            showPlayers(msg, lobby, "Lobby");

        } else if (msg.content === "!quit" && gamestatus === 1) {
            let temp = checkName(msg.member.user.username);
            if (temp !== -1) {
                removePlayer(temp, lobby);
                msg.reply("you have been removed from the lobby!")
            } else {
                msg.reply("You are not in the lobby!");
            }

        } else if (msg.content === "!start" && gamestatus === 1) {
            let numPlayers = lobby.length;

            // UNCOMMEMT FOR NON TESTING

          /*  if (numPlayers < 5 || numPlayers >= 10) {
               msg.channel.send("You need 5-10 players for a game!")
            } else { */
               

           // TESTING STUFF WITH 2 PEOPLE
                
                amtEvil = 1;
                playersNeededForQuest = [2,3,2,3,3];
                


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
                    let evil = Math.floor(Math.random() * (numPlayers) )
                        
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

                let partyLeaderRand = Math.floor(Math.random() * (numPlayers));
             //   lobby[partyLeader].isPartyLeader = 1;
                partyLeader = lobby[partyLeaderRand];
                msg.channel.send("<@" +partyLeader.id + "> is the party leader! Choose " + playersNeededForQuest[currentRound] + " players to go on this quest!");

           // }

           return;
        }

                // actual game
                if ( (successes < 3 || fails < 3) && gamestatus === 2)  {
                    // start of a round (selecting players to go on a quest)
                   
                       
                        if (msg.author === partyLeader.user) {  
                            
                            // check if the message was sent by party leader
                            if (playersOnQuest.length != playersNeededForQuest[currentRound] ) {
                            
                                let temp = addToQuest(msg);
                            
                            // check to see if message is actually for adding a user to quest
                            if (temp != -1) {
                                if (playersOnQuest.indexOf(temp) === -1) {
                                    playersOnQuest.push(temp);
                                    msg.channel.send("<@" + temp.id + "> has joined the quest!");
                                    if (playersOnQuest.length === playersNeededForQuest[currentRound]) {
                                        showPlayers(msg, playersOnQuest, "PLAYERS ON QUEST");
                                        msg.reply("Please type CONFIRM to validate that the selected party members are correct!");
                                    }
                                } else {
                                    //msg.reply("That person is already in the quest!");
                                    removePlayer(temp, playersOnQuest);
                                    msg.channel.send("<@" + temp.id + "> has been removed from the quest!")
                                }
                            }
                        } else {
                        // voting phase 
                        if (msg.content === "CONFIRM") {
                            msg.channel.send("Voting begins for party approval!")
                        }
                    } 
                        
                }

                    

                }



});



function addPlayer(playerName, playerId, user) {
    let player = new Player(playerId, playerName, user);
    lobby.push(player)
   // callback();
 
}


function showPlayers(msg, arrayOfPlayers, name) {
    msg.channel.send("====================================\n" + name + "\n====================================\n")

    let temp = "";
    
    for (let i = 0; i < arrayOfPlayers.length; i++) {
       temp +=  arrayOfPlayers[i].name + "\n";
    }
    msg.channel.send(temp);
}

function removePlayer(player, array) {
    let num = array.indexOf(player)
    if (num > -1) {
      array.splice(num, 1);  
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

function addToQuest(msg) {
    for (let i = 0; i < lobby.length; i++) {
        if (msg.mentions.users.has(lobby[i].id)) {
            return lobby[i];
        }
    }
    return -1;
}



client.login(auth.token)
