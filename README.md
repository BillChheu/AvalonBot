# Avalon Bot

![Avalon Picture](https://www.boardgamequest.com/wp-content/uploads/2013/07/Resistance-Avalon.jpg)

Avalon Bot is a discord bot used to moderate and enable gameplay of the social deduction board game *Avalon: The Resistance*

[Rules and Explanation](http://upload.snakesandlattes.com/rules/r/ResistanceAvalon.pdf)

## Features
- Gives roles to players at the start of the game
- Voting system for both the nomination of players and for the quest

## Commands
- !end
  - Ends the current game if there is one
- !showlobby
  - prints a list of players in lobby
  
- Lobby based commands
  - !avalon
    - Starts a lobby and joins it if one has not yet been created
  - !join
    - Joins a lobby if there is one
   - !quit
      - Quits the lobby if the player is in it
   - !start
      - Starts the game with all the players in the lobby
     
- Game based commands
  - @playername (only for party leader of quest)
    - Nominates that player for the current quest
   - !agree (only when voting for player nominations)
      - Votes for the party leader's nomination
    - !disagree (only when voting for player nominations)
       - Votes against the party leader's nomination
    - !success (only when on the quest)
        - Adds a "success" to the quest
    - !fail (only when on the quest)
        - Adds a "failure" to the quest
        
    
    
## Built With
- [Discord.JS](https://discord.js.org/#/)

## Future Plans
- Special Roles (such as Merlin and the Assassin)
- Spectators (They will only know roles and can not participate)
