# Maze 64
This is a simple maze game implemented for the [bitwise challenge](https://github.com/zesterer/the-bitwise-challenge).

# Usage
Open `index.html` in your browser.
The current state can be viewed as a url parameter.

# state
The lower 32 bits are used as a seed for generating the maze using a randomized depth first search algorithm.

The size of the maze is determined by a two bit 'scale'.
The four sizes are small (16x16), medium (64x64), large (256x256) and xlarge(1024x1024). This corresponds to using 4, 6, 8 or 10 bits to encode both the x and y position of the player.

This gives us at least 10 bits left over to play with. Not sure what to do with that yet.

state: `<unused:4><x:12><y:12><scale:4><seed:32>`

# reference
* [randomized depth first search](https://en.wikipedia.org/wiki/Maze_generation_algorithm#Randomized_depth-first_search)
