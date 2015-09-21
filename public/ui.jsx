var ResultsList = React.createClass({
    getInitialState: function() {
        return {items: []};
    },
    componentDidMount: function() {
        DataService.notify(function(results) {
            this.setState({items: results});
        }.bind(this));
    },
  render: function() {
    var createItem = function(result, index) {
      return <tr key={result.competitor.id}>
            <td>{result.competitor.name}</td>
        </tr>;
    };
    return <table>{this.state.items.map(createItem)}</table>;
  }
});

React.render(<ResultsList />, $("[data-role='results']")[0]);
