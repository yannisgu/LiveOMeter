"use strict";

var ResultsList = React.createClass({
    displayName: "ResultsList",

    currentEventId: null,
    timeout: null,
    setEvent: function setEvent(eventId) {
        window.currentCourse = DataService.getCourse(eventId);
        this.currentEventId = eventId;
        this.updateResults(eventId, true, currentCourse);
        if (!this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout((function () {
            this.updateResults(eventId, true, currentCourse);
        }).bind(this), 15000);
    },
    updateResults: function updateResults(eventId, redrawCanvas, currentCourse) {
        DataService.getResults(eventId, (function (results) {
            if (redrawCanvas) {
                Canvas.draw(results.event, results.points);
            }
            this.setState(results);
        }).bind(this), currentCourse);
    },
    getInitialState: function getInitialState() {
        return { items: [] };
    },
    componentDidMount: function componentDidMount() {
        DataService.notify((function (results) {
            this.setState(results);
        }).bind(this));
        DataService.onCourseChanged((function (course) {
            this.updateResults(this.currentEventId, false, course);
        }).bind(this));
    },
    render: function render() {
        var time = (function (time, isAbsolute) {
            if (!time) {
                return "";
            }

            if (isAbsolute) {
                time = time + this.state.event.timezone * 60;
            }
            var isNegative = time < 0;
            if (isNegative) {
                time *= -1;
            }
            var hours = Math.floor(time % 86400 / 3600),
                minutes = Math.floor((time % 86400 - 3600 * hours) / 60),
                seconds = Math.floor(time % 86400 - hours * 3600 - 60 * minutes);
            return (isNegative ? "-" : "") + (hours > 0 ? (hours < 10 ? "0" : "") + hours + ":" : "") + (10 > minutes ? "0" : "") + minutes + ":" + (10 > seconds ? "0" : "") + seconds;
        }).bind(this);

        var createControlCell = function createControlCell(control, index) {
            return React.createElement(
                "td",
                { style: control.isError ? { 'background-color': 'red', color: 'white' } : {} },
                time(control.diff),
                " ",
                React.createElement("br", null),
                time(control.total)
            );
        };

        var createItem = function createItem(result, index) {
            return React.createElement(
                "tr",
                { key: result.competitor.id },
                React.createElement(
                    "td",
                    null,
                    result.competitor.name
                ),
                React.createElement(
                    "td",
                    null,
                    time(result.startTime, true)
                ),
                result.controls.map(createControlCell)
            );
        };

        var getHeader = function getHeader(count) {
            var controls = [];
            for (var i = 1; i <= count; i++) {
                controls.push(i);
            }

            return React.createElement(
                "tr",
                null,
                React.createElement("th", null),
                React.createElement(
                    "th",
                    null,
                    "Start"
                ),
                controls.map(function (control, i) {
                    return React.createElement(
                        "th",
                        null,
                        control
                    );
                }),
                React.createElement(
                    "th",
                    null,
                    "Finish"
                )
            );
        };

        return React.createElement(
            "table",
            null,
            getHeader(this.state.countControls),
            this.state.items.map(createItem)
        );
    }
});

var resultList = React.render(React.createElement(ResultsList, null), $("[data-role='results']")[0]);

var EventChooser = React.createClass({
    displayName: "EventChooser",

    getInitialState: function getInitialState() {
        return { events: [] };
    },
    componentDidMount: function componentDidMount() {
        DataService.getEvents(2015, (function (events) {
            this.setState({ events: events });
        }).bind(this));
    },
    handleChange: function handleChange(event) {
        console.log(event.target.value);
        console.log(resultList);
        resultList.setEvent(event.target.value);
    },
    render: function render() {
        return React.createElement(
            "select",
            { onChange: this.handleChange },
            this.state.events.map(function (event) {
                if (event.id) {
                    return React.createElement(
                        "option",
                        { value: event.id },
                        event.name
                    );
                }
            })
        );
    }
});

React.render(React.createElement(EventChooser, null), $("[data-role='events']")[0]);
