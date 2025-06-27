const canvas = document.getElementsByTagName('canvas')[0]
const ctx = canvas.getContext("2d");

const cell = 6 // pixel width of a position on the grid
const wall = 2 // pixel width of a maze wall
const size = cell + wall // pixel distance between each grid cell

// colors
const player = 'red'
const goal = 'green'
const background = 'white'
const trail = 'grey'
const forground = 'black'

// format number as a fixed length hex string
const hex = (i, l) => i.toString(16).padStart(l, '0')
// 32-bit PRNG. this doesn't have to be very good
// but we do need to be able to seed it.
// https://gist.github.com/blixt/f17b47c62508be59987b
const mb32 = a => (t) => (a = a + 1831565813 | 0, t = Math.imul(a ^ a >>> 15, 1 | a), t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, (t ^ t >>> 14) >>> 0) / 2 ** 32;

const state = {
    params: new URLSearchParams(window.location.search),
    updateUrl() {
        window.location.hash = '#0' + hex(this.x, 3) + hex(this.y, 3) + hex(this.scale, 1) + hex(this.seed, 4)
    },
    init() {
        // hash is either empty or starts with '#'
        // pull state from the url hash if it's there
        // otherwise start from a random initial state
        let state = window.location.hash.slice(1)
        if (state) {
            // the high nibble is not used
            this.x = parseInt(state.slice(1, 4), 16)
            this.y = parseInt(state.slice(4, 7), 16)
            this.scale = parseInt(state.slice(7, 8), 16)
            this.seed = parseInt(state.slice(8), 16)
        } else {
            this.seed = Math.round(Math.random() * 0xFFFF)
            this.x = 0
            this.y = 0
            this.scale = Math.round(Math.random() * 4)
            this.updateUrl()
        }
        this.height = this.width = 20 * (this.scale + 1)
        canvas.height = canvas.width = this.width * size + wall

        // make sure to only use the seeded rng
        this.rand = mb32(this.seed)

        // make a maze using a randomized depth first search
        // grid records the "previous" position at each position
        this.grid = Array.from(Array(this.width), () => new Array(this.height))
        // the starting node comes from itself, so drawing it doesn't need a special case
        this.grid[0][0] = [0, 0]
        let w = this.width - 1, h = this.height - 1 // bounds check
        let stack = [[0, 0]]
        while (stack.length) {
            let p = stack.at(-1) // peek

            // make a list of valid neighbors that haven't been visited
            let N = []
            if (p[0] > 0 && !this.grid[p[0] - 1][p[1]]) { N.push([p[0] - 1, p[1]]) }
            if (p[0] < w && !this.grid[p[0] + 1][p[1]]) { N.push([p[0] + 1, p[1]]) }
            if (p[1] > 0 && !this.grid[p[0]][p[1] - 1]) { N.push([p[0], p[1] - 1]) }
            if (p[1] < h && !this.grid[p[0]][p[1] + 1]) { N.push([p[0], p[1] + 1]) }
            if (!N.length) {
                stack.pop()
                continue
            }
            // randomly select a neighbor and push that
            let n = N[Math.floor(this.rand() * N.length)]
            this.grid[n[0]][n[1]] = p
            stack.push(n)
        }
    },
}

const draw = {
    cell(x, y) { ctx.fillRect(x * size + wall, y * size + wall, cell, cell) },
    maze() {
        let width = state.width * size + wall
        let height = state.height * size + wall

        ctx.fillStyle = background
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = forground
        for (var i = 0; i < height; i += size) { ctx.fillRect(0, i, width, wall) }
        for (var i = 0; i < width; i += size) { ctx.fillRect(i, 0, wall, height) }
        // break down walls between connected cells
        ctx.fillStyle = background
        for (var x = 0; x < state.width; x++) {
            for (var y = 0; y < state.height; y++) {
                let p = state.grid[x][y]
                draw.cell((x + p[0]) / 2, (y + p[1]) / 2)
            }
        }

        ctx.fillStyle = trail
        let p = [state.x, state.y]
        while (p[0] || p[1]) {
            prev = state.grid[p[0]][p[1]]
            draw.cell(p[0], p[1])
            draw.cell((prev[0] + p[0]) / 2, (prev[1] + p[1]) / 2,)
            p = prev
        }
        draw.cell(p[0], p[1])

        ctx.fillStyle = goal
        draw.cell(state.width - 1, state.height - 1)

        ctx.fillStyle = player
        draw.cell(state.x, state.y)
    }
}

document.getElementById('new').addEventListener('click', function() {
    window.location.href = ''
})

document.addEventListener('keydown', function(event) {
    function moveif(keys, x, y) {
        if (keys.includes(event.key)) {
            event.preventDefault()

            // returns if moving to x,y is an invalid move
            if (x < 0 || x >= state.width || y < 0 || y >> state.height) return;
            // check if the cells are connected, and 
            let g0 = state.grid[state.x][state.y]
            let g1 = state.grid[x][y]
            if ((g0[0] == x && g0[1] == y) || (g1[0] == state.x && g1[1] == state.y)) {
                // don't leave a trail when backtracking
                // this would be nice to know by the player, but if we don't do this then the state can't perfectly encode the frame
                let g = state.grid[state.x][state.y]
                ctx.fillStyle = (g[0] == x && g[1] == y) ? background : trail
                draw.cell(state.x, state.y)
                draw.cell((state.x + x) / 2, (state.y + y) / 2)

                state.x = x
                state.y = y
                state.updateUrl()
                ctx.fillStyle = player
                draw.cell(state.x, state.y)
            }
        }
    }
    moveif(['w', 'ArrowUp'], state.x, state.y - 1)
    moveif(['a', 'ArrowLeft'], state.x - 1, state.y)
    moveif(['s', 'ArrowDown'], state.x, state.y + 1)
    moveif(['d', 'ArrowRight'], state.x + 1, state.y)
    // celebrate if we've reached the goal state
    if (state.x == state.width - 1 && state.y == state.height - 1) {
        window.location.href = 'https://www.youtube.com/watch?v=LlhKZaQk860'
    }
})

function main() {
    state.init()
    draw.maze()
}
