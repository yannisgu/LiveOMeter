var ResultsList = React.createClass({
    getInitialState: function() {
        return {items: []};
    },
    componentDidMount: function() {
        DataService.notify(function(results) {
            this.setState(results);
        }.bind(this));
    },
  render: function() {
    var time = function(time, isAbsolute) {
        if(isAbsolute) {
            time = time + this.state.event.timezone * 60
        }
        var isNegative = time < 0;
        if(isNegative)
        {
            time *= -1;
        }
        var hours = Math.floor(time % 86400 / 3600),
            minutes = Math.floor((time % 86400 - 3600 * hours) / 60);
            seconds = Math.floor(time % 86400 - hours *  3600 - 60 * minutes);
        return (isNegative ? "-" : "") + (hours > 0 ? ((hours < 10 ? "0" : "") + hours + ":") : "" ) + (10 > minutes ? "0" : "") + minutes + ":" + (10 > seconds ? "0" : "") + seconds;
    }.bind(this)

    var createControlCell = function(control, index) {
        return <td style={control.isError ? {'background-color': 'red', color: 'white'} : {}}>
            {time(control.diff)}
        </td>
    }

    var createItem = function(result, index) {
      return <tr key={result.competitor.id}>
            <td>{result.competitor.name}</td>
            <td>{time(result.startTime, true)}</td>
            {result.controls.map(createControlCell)}
        </tr>;
    };

    var getHeader = function(count) {
        var controls = [];
        for(var i = 1; i <= count; i++ ) {
            controls.push(i);
        }

        return <tr>
                <th></th>
                <th>Start</th>
                {controls.map(function(control, i) {
                    return <th>{control}</th>
                })}
                <th>Finish</th>
            </tr>
    }

    return <table>
            {getHeader(this.state.countControls)}

        {this.state.items.map(createItem)}
    </table>;
  }
});

React.render(<ResultsList />, $("[data-role='results']")[0]);
