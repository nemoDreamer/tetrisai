/**
 * @param {Object} weights
 * @param {number} weights.heightWeight
 * @param {number} weights.linesWeight
 * @param {number} weights.holesWeight
 * @param {number} weights.bumpinessWeight
 */
function AI(weights) {
    this.heightWeight = weights.heightWeight;
    this.linesWeight = weights.linesWeight;
    this.holesWeight = weights.holesWeight;
    this.bumpinessWeight = weights.bumpinessWeight;
}

AI.prototype._best = function (grid, workingPieces, workingPieceIndex, existingLines = 0) {
    var bestPiece = null;
    var bestScore = null;
    var workingPiece = workingPieces[workingPieceIndex];

    for (var rotation = 0; rotation < workingPiece.maxRotations; rotation++) {
        var _piece = workingPiece.clone();
        for (var i = 0; i < rotation; i++) {
            _piece.rotate(grid);
        }

        while (_piece.moveLeft(grid));

        while (grid.valid(_piece)) {
            var _pieceSet = _piece.clone();
            while (_pieceSet.moveDown(grid));

            var _grid = grid.clone();
            _grid.addPiece(_pieceSet);

            var score = null;
            var lines = _grid.lines();
            // clear before scoring/recursing, so every level sees the same post-clear board
            if (lines) _grid.clearLines();
            if (workingPieceIndex == workingPieces.length - 1) {
                score =
                    -this.heightWeight * _grid.aggregateHeight() +
                    this.linesWeight * (lines + existingLines) -
                    this.holesWeight * _grid.holes() -
                    this.bumpinessWeight * _grid.bumpiness();
            } else {
                score = this._best(_grid, workingPieces, workingPieceIndex + 1, lines).score;
            }

            if (score > bestScore || bestScore == null) {
                bestScore = score;
                bestPiece = _piece.clone();
            }

            _piece.column++;
        }
    }

    return { piece: bestPiece, score: bestScore };
};

AI.prototype.best = function (grid, workingPieces) {
    return this._best(grid, workingPieces, 0).piece;
};
