class Tile {
    constructor(value, row, col) {
        this.value = value;
        this.row = row;
        this.col = col;
        this.merged = false;
    }
}

class GameManager  {
    constructor(size = 4) {
        this.size = size;
        this.grid = this.emptyGrid();
        this.score = 0;
        this.addRandomTile();
        this.addRandomTile();
    }

    emptyGrid() {
        let grid = [];
        for (let r = 0; r < this.size; r++) {
            let row = [];
            for (let c = 0; c < this.size; c++) {
                row.push(null);
            }
            grid.push(row);
        }
        return grid;
    }

    availableCells() {
        let cells = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!this.grid[r][c]) {
                    cells.push({ row: r, col: c });
                }
            }
        }
        return cells;
    }

    addRandomTile() {
        let cells = this.availableCells();
        if (cells.length > 0) {
            let { row, col } = cells[Math.floor(Math.random() * cells.length)];
            let value = Math.random() < 0.9 ? 2 : 4;
            this.grid[row][col] = new Tile(value, row, col);
        }
    }

    slide(row) {
        let arr = row.filter(tile => tile !== null);
        for (let tile of arr) tile.merged = false;
        let result = [];
        while (arr.length > 0) {
            let tile = arr.shift();
            if (arr.length > 0 && arr[0].value === tile.value && !arr[0].merged && !tile.merged) {
                let mergedTile = new Tile(tile.value * 2, tile.row, tile.col);
                mergedTile.merged = true;
                this.score += mergedTile.value;
                arr.shift();
                result.push(mergedTile);
            } else {
                result.push(tile);
            }
        }
        while (result.length < this.size) {
            result.push(null);
        }
        return result;
    }

    move(direction) {
        let moved = false;
        switch (direction) {
            case 'left':
                for (let r = 0; r < this.size; r++) {
                    let newRow = this.slide(this.grid[r]);
                    for (let c = 0; c < this.size; c++) {
                        if (this.grid[r][c] !== newRow[c]) moved = true;
                        this.grid[r][c] = newRow[c];
                    }
                }
                break;
            case 'right':
                for (let r = 0; r < this.size; r++) {
                    let reversed = [...this.grid[r]].reverse();
                    let newRow = this.slide(reversed).reverse();
                    for (let c = 0; c < this.size; c++) {
                        if (this.grid[r][c] !== newRow[c]) moved = true;
                        this.grid[r][c] = newRow[c];
                    }
                }
                break;
            case 'up':
                for (let c = 0; c < this.size; c++) {
                    let col = [];
                    for (let r = 0; r < this.size; r++) col.push(this.grid[r][c]);
                    let newCol = this.slide(col);
                    for (let r = 0; r < this.size; r++) {
                        if (this.grid[r][c] !== newCol[r]) moved = true;
                        this.grid[r][c] = newCol[r];
                    }
                }
                break;
            case 'down':
                for (let c = 0; c < this.size; c++) {
                    let col = [];
                    for (let r = 0; r < this.size; r++) col.push(this.grid[r][c]);
                    let reversed = [...col].reverse();
                    let newCol = this.slide(reversed).reverse();
                    for (let r = 0; r < this.size; r++) {
                        if (this.grid[r][c] !== newCol[r]) moved = true;
                        this.grid[r][c] = newCol[r];
                    }
                }
                break;
        }
        if (moved) {
            this.addRandomTile();
        }
        return moved;
    }

    isGameOver() {
        if (this.availableCells().length > 0) return false;
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                let tile = this.grid[r][c];
                let dirs = [
                    { dr: 0, dc: 1 },
                    { dr: 1, dc: 0 },
                ];
                for (let { dr, dc } of dirs) {
                    let nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                        let neighbor = this.grid[nr][nc];
                        if (neighbor && neighbor.value === tile.value) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
}

export { GameManager ,Tile};
