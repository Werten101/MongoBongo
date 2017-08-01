
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var request = require('request');
var Article = require('./models/Article.js');
var Note = require('./models/Note.js');

mongoose.Promise = Promise;




app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));


mongoose.connect('mongodb://localhost/mongo-homework');
var db = mongoose.connection;


db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});


db.once("open", function() {
    console.log("Mongoose connection successful.");
});



app.get('/', function(req, res) {

    request("http://www.nytimes.com/", function(error, response, html) {
      
        var $ = cheerio.load(html);
      
        $("article h2").each(function(i, element) {

       
            var result = {};

        
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

          
            var entry = new Article(result);

          
            entry.save(function(err, doc) {
              
                if (err) {
                    console.log(err);
                }
             
                else {
                    console.log(doc);
                }
            });

        });
       
        res.render("articles");
    });
});

app.get("/articles", function(req, res) {

    Article.find({}, function(err, doc) {

        if (err) {
            res.send(err);
        } else {
            res.json(doc);
        }
    }).limit(10);

});

app.post("/articles/:id", function(req, res) {

    var newNote = new Note(req.body);

    newNote.save(function(err, doc) {

        if (err) {
            console.log(err);
        } else {
            Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id }).exec(function(err, newDoc) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(newDoc);
                }

            });

        }

    });

});


app.listen(3000, function() {
    console.log("App running on port 3000!");
});