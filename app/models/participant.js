var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

// event schema 
var ParticipantSchema = new Schema({
	event_id: {type: String, required: true},
	username: {type: String, required: true}
});

module.exports = mongoose.model('participants', ParticipantSchema);