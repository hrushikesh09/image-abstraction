var mongoose = require('mongoose');

var SearchSchema = mongoose.Schema({
  term: String,
  when: Date,
});

var search = mongoose.model('Search', SearchSchema);
module.exports = search;
