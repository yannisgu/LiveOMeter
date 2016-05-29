import * as DataService from '../data/ResultService'
import * as Canvas from '../ui/MapCanvas'
import app from '../App'
import ResultsStore from '../stores/ResultsStore'


var ResultsList = React.createClass({
    getInitialState: function() {
        return ResultsStore.get().results;
    },
    componentDidMount: function() {
        ResultsStore.on("update", (value) => this.setState(value.results));
    },
    showSplitOnMap: function(event) {
        var targetElement = $(event.target);
        var control = targetElement.parent().attr("data-control");
        var runnerId = targetElement.parents("tr").attr("data-runnerid");
        var leg1 = this.getLeg(runnerId, control);
        var bestRunner = _.sortBy(this.state.items, function(runner) {
            return runner.controls[control].diff;
        })[0];
        var leg2 = this.getLeg(bestRunner.competitor.id, control)
        Canvas.drawComparasion(leg1, leg2)
    },
    getLeg(runnerId, control, color) {
        var runner = _.find(this.state.items, function(runner) {
            return runner.competitor.id == runnerId;
        });
        var controlFrom = runner.controls[control / 1 - 1];
        var controlTo = runner.controls[control];
        var points = this.state.points[runnerId];
        return {controlFrom: controlFrom, controlTo: controlTo, trackpoints: points}
    },
  render: function() {
    var time = function(time, isAbsolute) {
        if(!time) {
            return "";
        }

        if(isAbsolute) {
            time = time + this.state.event.timezone * 60
        }
        var isNegative = time < 0;
        if(isNegative)
        {
            time *= -1;
        }
        var hours = Math.floor(time % 86400 / 3600),
            minutes = Math.floor((time % 86400 - 3600 * hours) / 60),
            seconds = Math.floor(time % 86400 - hours *  3600 - 60 * minutes);
        return (isNegative ? "-" : "") + (hours > 0 ? ((hours < 10 ? "0" : "") + hours + ":") : "" ) + (10 > minutes ? "0" : "") + minutes + ":" + (10 > seconds ? "0" : "") + seconds;
    }.bind(this)

    var createControlCell = function(control, index) {
        return <td style={control.isError ? {'background-color': 'red', color: 'white'} : {}} onClick={this.showSplitOnMap} data-control={index}>
            {time(control.diff)} <br />
            {time(control.total)}
        </td>
    }.bind(this)

    var createItem = function(result, index) {
      return <tr key={result.competitor.id} data-runnerid={result.competitor.id}>
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
