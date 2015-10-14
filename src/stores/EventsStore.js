import Freezer from 'freezer-js'
import * as GpsSeuranta from '../data/GpsSeuranta'

let store = new Freezer({year: null, events: []});
export default store;

var year = new Date().getFullYear();
GpsSeuranta.getEvents(year, function(events) {
    store.get().set({year: year, events: events});
});
