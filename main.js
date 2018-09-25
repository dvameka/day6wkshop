require('dotenv').config()
const express =  require("express"),
      mysql = require("mysql"),
      bodyParser = require("body-parser");

var app = express();
const NODE_PORT = process.env.PORT;

const sqlFindAllFilms = "SELECT * FROM film";

/*
const sqlFindAllBooks = "SELECT * FROM books LIMIT ? OFFSET ?"
const sqlFindOneBook = "SELECT idbooks, name, author, publish_year, isbn FROM books WHERE idbooks=? ";
*/

console.log("DB USER : " + process.env.DB_USER);
console.log("DB NAME : " + process.env.DB_NAME);

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONLIMIT
    //debug: true
})

var makeQuery = (sql, pool)=>{
    console.log(sql);
    
    return  (args)=>{
        let queryPromsie = new Promise((resolve, reject)=>{
            pool.getConnection((err, connection)=>{
                if(err){
                    reject(err);
                    return;
                }
                console.log(args);
                
                connection.query(sql, args || [], (err, results)=>{
                    connection.release();
                    if(err){
                        reject(err);
                        return;
                    }
                    console.log(">>> "+ results);
                    resolve(results); 
                })
            });
        });
        return queryPromsie;
    }
}

var findAllFilms = makeQuery(sqlFindAllFilms, pool);
/* 
var findOneBookById = makeQuery(sqlFindOneBook, pool);
var findAllBooks = makeQuery(sqlFindAllBooks, pool);
*/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/films", (req, res)=>{
    findAllFilms().then((results)=>{
        res.json(results);
    }).catch((error)=>{
        console.log(error);
        res.status(500).json(error);
    });
});


app.get("/films/:film_id", (req, res)=>{
    console.log("/films params !");
    let filmId = req.params.filmId;
    console.log(filmId);
    findAllFilms([parseInt(filmId)]).then((results)=>{
        console.log(results);
        res.json(results);
    }).catch((error)=>{
        res.status(500).json(error);
    })
    
})

app.get("/films", (req, res)=>{
    console.log("/films query !");
    var filmId = req.query.filmId;
    console.log(filmId);
    if(typeof(filmId) === 'undefined' ){
        console.log(">>>" + filmId);
        findAllFilms([5,5]).then((results)=>{
            console.log(results);
            res.json(results);
        }).catch((error)=>{
            res.status(500).json(error);
        });
    }else{
        findOneFilmById([parseInt(filmId)]).then((results)=>{
            console.log(results);
            res.json(results);
        }).catch((error)=>{
            res.status(500).json(error);
        });
    }
    
})

app.listen(NODE_PORT, ()=>{
    console.log(`Listening to server at ${NODE_PORT}`)
})
