# IGS Pandanet Go Client
A client to play at IGS Pandanet Go server

# How it works?
You just have a telnet console forwarded to web interface,
all the actions, e.g. playing games or chatting is done purely
via telnet commands, type "help" for more details. Board is synced
to VERBOSE output of a board in the console, if verbose is false board
won't sync, so make sure to run command **toggle verbose true**!
Whenever you click on board square a move is sent via telnet, but it only
works during the game, otherwise you'll get an error.
