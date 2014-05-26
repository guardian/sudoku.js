/**
 * @jsx React.DOM
 */
(function () {
  var INIITAL_WIDTH = 300;
  var INITIAL_HEIGHT = 300;

  var KEYCODE_BACKSPACE = 8;
  var KEYCODE_DELETE = 46;
  var KEYCODE_LEFT = 37;
  var KEYCODE_UP = 38;
  var KEYCODE_RIGHT = 39;
  var KEYCODE_DOWN = 40;

  var sizeForm = document.getElementById("size-form");

  var Cell = React.createClass({
    render: function () {
      var x = this.props.x;
      var y = this.props.y;
      var middleX = x + (this.props.width / 2);
      var middleY = y + (this.props.height / 2);

      /** Not sure why but couldn't get this to work */
      var className = (this.props.hasFocus) ? "grid__cell__rect-focused" : "grid__cell__rect-unfocused";

      var style = (function () {
        if (this.props.hasFocus && this.props.isInConflict) {
          return {fill: "#FA5858"};
        } else if (this.props.hasFocus) {
          return {fill: "#efefef"};
        } else if (this.props.isInConflict) {
          return {fill: "#F5A9A9"};
        } else {
          return {};
        }
      }).call(this);

      var textStyle = {
        fontSize: this.props.width * 0.9
      };

      return (
        <g className="grid__cell">
          <rect x={x} y={y} width={this.props.width} height={this.props.height} style={style} />
          <text x={middleX} y={middleY} className="grid__cell-text" style={textStyle}>
            {this.props.value}
          </text>
        </g>
      );
    }
  });

  var Grid = React.createClass({
    render: function () {
      var width = this.props.width;
      var height = this.props.height;

      /** Bold lines denoting the boundaries of the inner grids */
      var emLines = [];

      for (var i = 1; i < 3; ++i) {
        var y = (height / 3) * i;

        emLines.push(
          <line x1="0" y1={y} x2={width} y2={y} />
        );

        var x = (width / 3) * i;

        emLines.push(
          <line x1={x} y1="0" x2={x} y2={height} />
        );
      }

      /** Other lines, denoting cells */
      var cellLines = [];

      for (var i = 0; i < 10; ++i) {
        var y = (height / 9) * i;

        cellLines.push(
            <line x1="0" y1={y} x2={width} y2={y} />
        );

        var x = (width / 9) * i;

        cellLines.push(
            <line x1={x} y1="0" x2={x} y2={height} />
        );
      }

      return (
        <g className="grid">
          <rect x="0" y="0" width={width} height={height} />
          <g className="grid__lines">
            {cellLines}
          </g>
          <g className="grid__em-lines">
            {emLines}
          </g>
        </g>
      );
    }
  });

  var Sudoku = React.createClass({
    getInitialState: function () {
      var cells = [];

      for (var col = 0; col < 9; col++) {
        for (var row = 0; row < 9; row++) {
          cells.push({
            col: col,
            row: row,
            value: null,
            editable: true
          });
        }
      }

      return {
        width: 300,
        height: 300,
        cells: cells,
        focus: null
      };
    },

    cellWidth: function () {
      return this.state.width / 9;
    },

    cellHeight: function () {
      return this.state.height / 9;
    },

    handleClick: function (event) {
      var clientRect = this.getBoundingClientRect();

      var x = event.clientX;
      var y = event.clientY;

      if (x >= clientRect.left && x <= clientRect.right &&
          y >= clientRect.top && y <= clientRect.bottom) {

        var xOffset = x - clientRect.left;
        var yOffset = y - clientRect.top;

        var col = Math.floor(xOffset / this.cellWidth());
        var row = Math.floor(yOffset / this.cellHeight());

        this.setFocus(col, row);
      } else {
        this.unfocus();
      }
    },

    getBoundingClientRect: function (event) {
      return this.getDOMNode().getBoundingClientRect();
    },

    updateState: function (updates) {
      this.setState(React.addons.update(this.state, updates));
    },

    handleResize: function (event) {
      event.preventDefault();

      var width = document.getElementById("size-form__width").value;
      var height = document.getElementById("size-form__height").value;

      this.updateState({
        width: {$set: width},
        height: {$set: height}
      });
    },

    unfocus: function () {
      this.updateState({
        focus: {$set: null}
      });
    },

    hasFocus: function () {
      return this.state.focus != null;
    },

    isFocussed: function (cell) {
      return this.hasFocus() && this.state.focus.col === cell.col && this.state.focus.row === cell.row;
    },

    updateCell: function (col, row, update) {
      this.updateState({
        cells: {
          $set: this.state.cells.map(function (cell) {
            if (cell.col == col && cell.row == row) {
              return React.addons.update(cell, update);
            } else {
              return cell;
            }
          })
        }
      });
    },

    getCell: function (col, row) {
      for (var i = 0; i < this.state.cells.length; ++i) {
        var cell = this.state.cells[i];

        if (cell.col == col && cell.row == row)
          return cell;
      }

      throw "No cell at " + col + ", " + row;
    },

    handleKeyDown: function (event) {
      if (this.hasFocus()) {
        event.preventDefault();

        var col = this.state.focus.col;
        var row = this.state.focus.row;
        var focussedCell = this.getCell(col, row);

        if (event.keyCode == KEYCODE_UP) {
          this.setFocus(focussedCell.col, Math.max(0, focussedCell.row - 1));
        } else if (event.keyCode == KEYCODE_DOWN) {
          this.setFocus(focussedCell.col, Math.min(8, focussedCell.row + 1));
        } else if (event.keyCode == KEYCODE_LEFT) {
          this.setFocus(Math.max(focussedCell.col - 1, 0), focussedCell.row);
        } else if (event.keyCode == KEYCODE_RIGHT) {
          this.setFocus(Math.min(focussedCell.col + 1, 8), focussedCell.row);
        }

        if (focussedCell.editable) {
          if (event.keyCode >= 49 && event.keyCode <= 58) {
            var number = event.keyCode - 48;
            
            this.updateCell(col, row, {
              value: {$set: number}
            });
          }

          if (event.keyCode == KEYCODE_BACKSPACE || event.keyCode == KEYCODE_DELETE) {
            event.preventDefault();

            this.updateCell(col, row, {
              value: {$set: null}
            });
          }
        }
      }
    },

    setFocus: function (col, row) {
      this.updateState({
        focus: {
          $set: {
            row: row,
            col: col
          }
        }
      });
    },

    componentDidMount: function () {
      sizeForm.addEventListener("submit", this.handleResize);
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("click", this.handleClick);
    },

    componentWillUnmount: function () {
      sizeForm.removeEventListener("submit", this.handleResize);
      window.remoteEventListener("keydown", this.handleKeyDown);
      window.addEventListener("click", this.handleClick);
    },

    getConflicts: function () {
      var rows = {};
      var columns = {};
      var squares = {};

      // First pass, insert into the above hashes what is in each row, column and square
      for (var i = 0; i < this.state.cells.length; ++i) {
        var cell = this.state.cells[i];

        if (cell.value != null) {
          if (!rows.hasOwnProperty(cell.row)) {
            rows[cell.row] = [];
          }
          rows[cell.row].push(cell.value);

          if (!columns.hasOwnProperty(cell.col)) {
            columns[cell.col] = [];
          }
          columns[cell.col].push(cell.value);

          var squareX = Math.floor(cell.col / 3);
          var squareY = Math.floor(cell.row / 3);

          if (!squares.hasOwnProperty(squareX)) {
            squares[squareX] = {};
          }
          if (!squares[squareX].hasOwnProperty(squareY)) {
            squares[squareX][squareY] = [];
          }

          squares[squareX][squareY].push(cell.value);
        }
      }

      // Now iterate through each and return conflicts found
      var conflicts = {
        rows: [],
        columns: [],
        squares: []
      };
      
      // Really, JavaScript?
      var sortNumerically = function (xs) {
        xs.sort(function (a, b) { return a - b; });
      };

      var hasConsecutiveDuplicate = function (xs) {
        for (var i = 1; i < xs.length; ++i) {
          if (xs[i] === xs[i - 1]) {
            return true;
          }
        }

        return false;
      };

      var hasDuplicate = function (xs) {
        sortNumerically(xs);
        return hasConsecutiveDuplicate(xs);
      };

      // REALLY, JavaScript?!
      for (var row in rows) {
        if (rows.hasOwnProperty(row)) {
          if (hasDuplicate(rows[row])) {
            conflicts.rows.push(parseInt(row));
          }
        }
      }

      for (var column in columns) {
        if (columns.hasOwnProperty(column)) {
          if (hasDuplicate(columns[column])) {
            conflicts.columns.push(parseInt(column));
          }
        }
      }

      for (var squareX in squares) {
        if (squares.hasOwnProperty(squareX)) {
          for (var squareY in squares[squareX]) {
            if (squares[squareX].hasOwnProperty(squareY)) {
              if (hasDuplicate(squares[squareX][squareY])) {
                conflicts.squares.push({
                  x: parseInt(squareX),
                  y: parseInt(squareY)
                });
              }
            }
          }
        }
      }

      return conflicts;
    },

    render: function () {
      var conflicts = this.getConflicts();
      var cells = [];

      for (var i = 0; i < this.state.cells.length; ++i) {
        var cell = this.state.cells[i];

        var cellX = this.cellWidth() * cell.col;
        var cellY = this.cellHeight() * cell.row;

        var squareX = Math.floor(cell.col / 3);
        var squareY = Math.floor(cell.row / 3);

        /** TODO this sucks. Use a library such as Underscore or Lo Dash? */
        var squareConflict = false;

        for (var j = 0; j < conflicts.squares.length; ++j) {
          var square = conflicts.squares[j];

          if (square.x == squareX && square.y == squareY) {
            squareConflict = true;
            break;
          }
        }

        var conflicted = squareConflict ||
              (conflicts["rows"].indexOf(cell.row) != -1) ||
              (conflicts["columns"].indexOf(cell.col) != -1);

        cells.push(
          <Cell x={cellX} y={cellY} width={this.cellWidth()} height={this.cellHeight()} value={cell.value} hasFocus={this.isFocussed(cell)} isInConflict={conflicted} />
        );
      }

      return (
        <svg width={this.state.width} height={this.state.height}>
          <g className="sudoku">
            {cells}
            <Grid width={this.state.width} height={this.state.height} />
          </g>
        </svg>
      );
    }
  });

  React.initializeTouchEvents(true);
  React.renderComponent(
    <Sudoku />,
    document.getElementById("container")
  );
})();
