/**
 * @jsx React.DOM
 */
(function () {
  var INIITAL_WIDTH = 300;
  var INITIAL_HEIGHT = 300;

  var sizeForm = document.getElementById("size-form");

  var Cell = React.createClass({
    render: function () {
      var x = this.props.x;
      var y = this.props.y;
      var middleX = x + (this.props.width / 2);
      var middleY = y + (this.props.height / 2);

      var style = {
        fontSize: this.props.width * 0.95
      };

      /** Not sure why but couldn't get this to work */
      var className = (this.props.hasFocus) ? "grid__cell__rect-focused" : "grid__cell__rect-unfocused";

      var style = (this.props.hasFocus) ? {fill: "#efefef"} : {};

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
            hasFocus: false,
            editable: true
          });
        }
      }

      return {
        width: 300,
        height: 300,
        cells: cells
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

    handleResize: function (event) {
      event.preventDefault();

      var width = document.getElementById("size-form__width").value;
      var height = document.getElementById("size-form__height").value;

      this.setState({
        width: width,
        height: height,
        cells: this.state.cells
      });
    },

    unfocus: function () {
      this.mapCells(function (cell) {
        return {
          col: cell.col,
          row: cell.row,
          value: cell.value,
          hasFocus: false,
          editable: cell.editable
        };
      });
    },

    handleKeyDown: function (event) {
      if (event.keyCode >= 48 && event.keyCode <= 58) {
        var number = event.keyCode - 48;

        this.mapCells(function (cell) {
          var newValue = (cell.hasFocus && cell.editable) ? number : cell.value;

          return {
            col: cell.col,
            row: cell.row,
            value: newValue,
            hasFocus: cell.hasFocus,
            editable: cell.editable        
          };
        });
      }
    },

    mapCells: function (f) {
      this.setState({
        width: this.state.width,
        height: this.state.height,
        cells: this.state.cells.map(f)
      });
    },

    setFocus: function (col, row) {
      this.mapCells(function (cell) {
        var hasFocus = (cell.col == col && cell.row == row);

        /** TODO: include Underscore and use Object.extend? */
        return {
          col: cell.col,
          row: cell.row,
          value: cell.value,
          hasFocus: hasFocus,
          editable: cell.editable
        };
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

    render: function () {
      var cells = [];

      var cellWidth = this.state.width / 9;
      var cellHeight = this.state.height / 9;

      for (var i = 0; i < this.state.cells.length; ++i) {
        var cell = this.state.cells[i];

        var cellX = cellWidth * cell.col;
        var cellY = cellHeight * cell.row;

        cells.push(
          <Cell x={cellX} y={cellY} width={cellWidth} height={cellHeight} value={cell.value} hasFocus={cell.hasFocus} />
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

