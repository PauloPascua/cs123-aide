var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

// event schema 
var EventSchema = new Schema({
	name: String,
	description: String,
	owner: { type: String, required: true }
});

module.exports = mongoose.model('Event', EventSchema);