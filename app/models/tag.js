var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TagSchema = new Schema({
	event_id: {type: String, required: true},
	tag: {type: String, required: true}
});

module.exports = mongoose.model('tags', TagSchema);