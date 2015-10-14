import * as DataService from '../data/ResultService'
import * as Canvas from '../ui/MapCanvas'
import app from '../app'
import ResultsStore from '../stores/ResultsStore'

var EventChooser = React.createClass({
    getInitialState: function() {
        return {events: []};
    },
    componentDidMount: function() {
        DataService.getEvents(2015, function(events) {
            this.setState({events: events});
        }.bind(this));
    },
    handleChange: function(event) {
        app.emit('changeCurrentEvent', event.target.value)
    },
    render: function() {
        return <select onChange={this.handleChange}>
            {this.state.events.map(function(event) {
                    if(event.id) {
                        return <option value={event.id}>{event.name}</option>
                    }
                }
            )}
        </select>
    }
});

React.render(<EventChooser />, $("[data-role='events']")[0]);
