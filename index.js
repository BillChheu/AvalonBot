
const Discord = require("discord.js")
const client = new Discord.Client();
const auth = require("./token.json")

class Player {
    constructor(playerId, playerName, user) { 
        this.roleOfPlayer = 0; 
        this.name = playerName;
        this.id = playerId;
        this.user = user
       
    }
} 

const successEmoji = ":blue_circle:"
const failureEmoji = ":red_circle:"


let gamestatus = 0;

let lobby = [];
let amtEvil = 0;
let roundHistory = [];
let playersNeededForQuest = [];
let needTwoFails;

let currentRound = 0;
let successes = 0;
let fails = 0;
let playersOnQuest = [];
let partyLeader;

let votesOfPlayers;
let failVotes = 0;
let numFails = 1;

let consecutiveVotingFailures = 0;


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
                playersNeededForQuest = [2,2,2,2,2];
                needTwoFails = 1;
                


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

                getNextPartyLeader();
                msg.channel.send("<@" +partyLeader.id + "> is the party leader! Choose " + playersNeededForQuest[currentRound] + " players to go on this quest!");

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
                                    removePlayer(temp, playersOnQuest);
                                    msg.channel.send("<@" + temp.id + "> has been removed from the quest!")
                                }
                            }
                        } else {
                            // voting phase
                        // confirmation of party selected once it is full
                        if (msg.content === "CONFIRM") {
                            msg.channel.send("Voting begins for party approval!");

                                
                            for (let i = 0; i < lobby.length; i++) {
                                lobby[i].user.send("Type '!agree' to vote for the proposed party or type '!disagree' for the proposed party!")
                            }
                          
                            vote(lobby, "agree", "disagree");
                            client.on("waitForVotes", lobbyVote = () => {
                                let totalVotes = 0;
                                for (let i = 0; i < lobby.length; i++) {
                                    let voteValue = votesOfPlayers.get(lobby[i].user);
                                    totalVotes += voteValue;
    
                                    if (voteValue === 1) {
                                        msg.channel.send(lobby[i].name + " voted for the party!");    
                                    } else if (voteValue === -1) {
                                        msg.channel.send(lobby[i].name + " voted against the party!");
                                    }
                                }

                                client.off("waitForVotes", lobbyVote);
    
                                if (totalVotes > 0) {
                                    msg.channel.send("The vote has passed! The quest will now begin!");
                                    consecutiveVotingFailures = 0;
                                    totalVotes = 0;
                                    // testing purpose

                                    for (let i = 0; i < playersOnQuest.length; i++) {
                                        playersOnQuest[i].user.send("Type '!success' to succeed the quest or type '!fail' to fail the quest (should only do if you are EVIL!)")
                                    }

                                    vote(playersOnQuest, "success", "fail");
                                    client.on("waitForVotes", questVote = () => {
                                        msg.channel.send("Voting has finished!");
                                        for (let i = 0; i < lobby.length; i++) {
                                            let voteValue = votesOfPlayers.get(playersOnQuest[i].user);
                                            
                                            if (voteValue === -1)
                                                failVotes++;
                                        }

                                        if (currentRound === 3 && needTwoFails === 1) {
                                            msg.channel.send("This quest requires 2 failure votes to fail the quest!")
                                            numFails = 2;
                                        } else {
                                            numFails = 1;
                                        }

                                        client.off("waitForVotes", questVote);

                                        if ( failVotes < numFails) {
                                            successes++;
                                            roundHistory[currentRound] = successEmoji;
                                            msg.channel.send("The quest is a SUCCESS!");
                                            if (failVotes > 0)
                                                msg.channel.send("There was 1 failure!");
                                        } else {
                                            fails++;
                                            roundHistory[currentRound] = failureEmoji;
                                            msg.channel.send("The quest was a FAILURE!\nThere was " + failVotes + " failure(s)!");
                                        }

                                        currentRound++;
                                        getNextPartyLeader();
                                        showScoreboard(msg);

                                        if (successes >= 3) {
                                            msg.channel.send("Good wins!\nEnter 'RESTART' to make a new game or 'RETURN' to go back to lobby");
                                            gamestatus = 4;
                                        } else if (fails >= 3) {
                                            msg.channel.send("Evil wins!\nEnter 'RESTART' to make a new game or 'RETURN' to go back to lobby")
                                            gamestatus = 4;
                                        } else {
                                            msg.channel.send("<@" + partyLeader.id + "> is the new party leader! Choose " + playersNeededForQuest[currentRound] + " players to go on the quest!");
                                            playersOnQuest = [];
                                            failVotes = 0;
                                        }

                                    });
                                    
              
                                
                                } else {
                                    consecutiveVotingFailures++;
                                    if (consecutiveVotingFailures >= 5) {
                                        // game over
                                        gamestatus = 4;
                                        msg.channel.send("Evil Wins! You have failed voting for the quest 5 consecutive times!\nType 'RESTART' to make a new game or 'RETURN' to go back to lobby")
                                    } else {
                                        msg.channel.send("The vote has failed!");
                                        getNextPartyLeader();
                                        msg.channel.send("<@" + partyLeader.id + "> is the new party leader! Choose " + playersNeededForQuest[currentRound] + " players to go on the quest!");
                                        playersOnQuest = [];
                                    }
                                }
                            });

                        } 
                        

                    } 
                        
                }

            }
            // game end
            if (gamestatus === 4) {
                if (msg.content === "RESTART") {
                    currentRound = 0;
                    playersOnQuest = [];
                    fails = 0;
                    roundHistory = [];
                    successes = 0;
                    gamestatus = 3;
                    getNextPartyLeader();
                    msg.channel.send("<@" + partyLeader.id + "> is the new party leader! Choose " + playersNeededForQuest[currentRound] + " players to go on the quest!");  
                    
                } else if (msg.content === "RETURN") {
                    gamestatus = 1;
                    currentRound = 0;
                    playersOnQuest = [];
                    roundHistory = [];
                    fails = 0;
                    successes = 0;
                    showPlayers(msg, lobby, "LOBBY");
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

 function vote(voters, agree, disagree) {
    let users = [];
     votesOfPlayers = new Map();
    for (let i = 0; i < voters.length; i++) {
        users[i] = voters[i].user;
    }

    let test = function(msg) {

        if (msg.author.bot)
            return;

        let voterIndex = users.indexOf(msg.author);
        //console.log(voterIndex);

        if (voterIndex != -1 && users.length != 0) {
            if (msg.content === "!"+ agree) {
                msg.author.send("You have voted " + agree + "!" );
                votesOfPlayers.set(users[voterIndex], 1);
                removePlayer(users[voterIndex], users);

                if (users.length === 0) {
                    client.off("message", test);
                    client.emit("waitForVotes");
                   // return votesOfPlayers;
                }

            } else if (msg.content === "!"+ disagree) {
                msg.author.send("You have voted " + disagree + "!");
                votesOfPlayers.set(users[voterIndex], -1);
                removePlayer(users[voterIndex], users);
                
                if (users.length === 0) {
                    client.off("message", test);
                    client.emit("waitForVotes");
                    //return votesOfPlayers;
                }

            } else {
                msg.author.send("Invalid Response!")
            }
        }
    }
      client.on("message",  test);
}

function getNextPartyLeader() {

    if (partyLeader === undefined) {
        let partyLeaderRand = Math.floor(Math.random() * (lobby.length));
        partyLeader = lobby[partyLeaderRand];
    }



    let index = lobby.indexOf(partyLeader);
    index++;

    if (index >= lobby.length) {
        index = 0;
        partyLeader = lobby[index];
    } else {
        partyLeader = lobby[index]
    }
}

function showScoreboard(msg) {
    let scoreboard = "";
   for (let i = 0; i < 5; i++) {
       if (roundHistory[i] === undefined) {
            scoreboard += "[  ]  "
       } else {
           scoreboard += "[ " + roundHistory[i] + " ]  ";
       }
   }
   msg.channel.send(scoreboard);
}




client.login(auth.token)
