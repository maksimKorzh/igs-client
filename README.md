# IGS Pandanet Go Client
A client to play at IGS Pandanet Go server

# How it looks?
![IMAGE ALT TEXT HERE](https://raw.githubusercontent.com/maksimKorzh/igs-client/main/assets/scr.png)

# How it works?
You just have a telnet console forwarded to an ElectronJS web interface,
all the actions, e.g. playing games or chatting is done purely
via telnet commands, type "help" for more details. Board is synced
to VERBOSE output of a board in the console, if verbose is false board
won't sync, so make sure to run command **toggle verbose true**.
Whenever you click on board square a move is sent via telnet, but it only
works during the game, otherwise you'll get an error.

# Example workflow
    toggle quiet true          // suppress system messages like user logins
    toggle verbose true        // sync telnet board with GUI board
    stats [player]             // see your/opponent's current status, including default settings
    who 9k o                   // list 9 kyus open to play games
    match cft7821g B 19 30 30  // challenge user cft7821g to play 19x19 game with black, 30 min main time, 30 min byo-yomi per 25 stones
    automatch cft7821g         // challenge user cft7821g using default settings
    pass                       // pass move, see hints for scoring, you can click on board to remove dead stones
    resign                     // resign the game

# How to install it
    git clone https://github.com/maksimKorzh/igs-client
    cd igs-client
    npm install
    npm start
