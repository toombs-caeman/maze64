# Maze 64
This is a simple maze game implemented for the [bitwise challenge](https://github.com/zesterer/the-bitwise-challenge).

# Usage
Open `index.html` in your browser to view it locally. I'll host it somewhere eventually.

You can move through the maze with `wasd` or the arrow keys. Try to reach the green goal!

The current state can be viewed in the url.

# State
The lower 32 bits are used as a seed for generating the maze using a randomized depth first search algorithm.

The size of the maze is determined by a 4 bit 'scale' factor.

The player's x and y coordinates can be stored easily with 12 bits each.

state: `<unused:4><x:12><y:12><scale:4><seed:32>`

# Reference
* [randomized depth first search](https://en.wikipedia.org/wiki/Maze_generation_algorithm#Randomized_depth-first_search)
* [js seedable PRNGs](https://gist.github.com/blixt/f17b47c62508be59987b)
