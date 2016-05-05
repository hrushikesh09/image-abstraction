var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Search = require('./models/Search');
var Bing = require('bing.search');
var config = require('./config');

var app = express();
var imageSearch = new Bing(process.env.BING_KEY);

app.set('port', (process.env.PORT || 5000));
app.set('db', (process.env.MONGOLAB_URI || 'mongodb://' + config.db.host + ':27017/' + config.db.name));

mongoose.connect(app.get('db'), function(err, db){
  if(err){
    throw new Error('Database connection failed');
  } else {
    console.log('Successfully connected to Database');
  }
});

app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser({extended: true}));

app.get('/', function(req, res){
  res.render('index');
});

app.get('/api/imagesearch/:term', function(req, res){
  var query = require('url').parse(req.url,true).query;
  var images = [];

  term = req.params.term;
  offset = req.query.offset;

  if(term){
    var newSearch = Search({
      term: term,
      when: Date.now()
    });

    newSearch.save(function(err){
       if(err)
       console.log('err');
    });

    imageSearch.images(term, {top: offset}, function(err, results){
      if(err){
        throw new Error('Nothing to return');
      }

      for(key in results){
        images.push({
          url : results[key].url,
          snippet: results[key].title,
          thumbnail: results[key].thumbnail.url,
          context: results[key].sourceUrl
        });
      }

      res.send(images);

    });

  } else {
    res.send({error: 'enter a term'});
  }



});

app.get('/api/latest/imagesearch/', function(req,res){
  Search.find({}, {term: 1, when: 1, _id: 0}, {limit: 10, sort: {when: -1}}, function(err, doc){
    if(err)
    return err;

    res.send(doc);
  });
});

app.listen(app.get('port'), function(){
  console.log('App is running on port ' + app.get('port'));
});
