//서버를 기본 구성하는 init해주는 부분.
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , fs = require('fs')
  , path = require('path')
  , mongo = require('mongojs')
  ,	db = mongo('localhost/eunmi', ['scores']);


/**
	express라는 객체를 app으로 만들어줌.
*/
var app = express();

app.set('port', process.env.PORT || 8702);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
//!!!!
app.use(express.bodyParser());//for url parsing

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



//여기까지가 init;


/**
	url routing = /scores, /regscore, "/crossdomain.xml : unity web policy에 따라 필요한 파일"
*/
app.get('/scores', function(req, res){
	// res.header("Access-Control-Allow-Origin", "*");
	// res.header("Access-Control-Allow-Headers", "X-Requested-With");
	db.scores.find().sort({score : -1 }).limit(10).toArray( function (err, scores) {
		if (err) {
			res.json({result : false, scores : scores});
		}else{
			var data = ''; 
			for(i in scores){
				data += (scores[i].id + ':' + scores[i].score +',');
			}
			res.write(data);
			res.end();
		}
	});
});

app.get('/regscore', function(req, res){
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;//json형태로 인자들을 갖고있음.
	/*query = {
		key : value
		id : 'eunmi',
		score : '1241',

		//email : 'x_terc@nate.com'
	}*/
	var id = query.id
	, score =query.score;

	db.scores.save({id : id, score : score}, function (err) {
		if (err=== null) {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('Server Err');
		}
	});	
	res.end('Server Success');
});


app.get('/crossdomain.xml', function(req, res){

	fs.readFile('./crossdomain.xml', function(e, xml){
		res.writeHeader(200, {"Content-Type": "text/xml"});  
	    res.write(xml);  
	    res.end();  

	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

