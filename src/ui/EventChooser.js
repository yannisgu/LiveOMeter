import * as DataService from '../data/ResultService'
import * as Canvas from '../ui/MapCanvas'
import app from '../app'
import ResultsStore from '../stores/ResultsStore'
import eventsStore from '../stores/EventsStore'

var EventChooser = React.createClass({
    years: null,
    getInitialState: function() {
        var years = [];
        for(var i = new Date().getFullYear(); i > 2010; i--) {
            years.push(i);
        }
        this.years = years;
        return {events: [], years: years};
    },
    componentDidMount: function() {
        eventsStore.on("update", value => this.setState({events: value.events, years: this.years}))
    },
    handleChange: function(event) {
        app.emit('changeCurrentEvent', event.target.value)
    },
    handleYearChange: function(event) {
        app.emit('changeCurrentYear', event.target.value)
    },
    render: function() {
        return <div>
                <select onChange={this.handleYearChange}>
                    {this.state.years.map(function(i) {
                        return <option value={i}>{i}</option>
                    })}
                </select>
                <select onChange={this.handleChange}>
                    {this.state.events.map(function(event) {
                            if(event.id) {
                                return <option value={event.id}>{event.name}</option>
                            }
                        }
                    )}
                </select>
            </div>
    }
});

React.render(<EventChooser />, $("[data-role='events']")[0]);
