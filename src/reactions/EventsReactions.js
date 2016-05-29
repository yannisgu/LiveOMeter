import app from '../App'
import EventsStore from '../stores/EventsStore'
import * as GpsSeuranta from '../data/GpsSeuranta'

app.on("changeCurrentYear").subscribe(function(year) {
    GpsSeuranta.getEvents(year, function(value) {
        EventsStore.get().set({year: year, events: value})
    })
});
