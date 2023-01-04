const express = require("express");
const knex = require("./db/knex");
const PORT = 5000;
const app = express();
const bodyParser = require('body-parser')
const morgan = require('morgan')
const routerV1 = require('./routes/v1/index')


app.get("/ping", (req, res) => {
    res.send({
        error: false,
        message: "Server is healthy",
    });
});
// app.listen(PORT, () => {
//     console.log("Server started listening on PORT : " + PORT);
// });

app.get("/", (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end('Hello World!');
});

app.get("/test", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get("/uji1", (req, res) => {
    res.status(200).json({
        success: true,
        data: [{
            nim: "202021420024",
            nama: "Dwi Cahyono",
            prodi: "Teknik Informatika",
            fakultas: "Teknik",
            no_telfon: "082142969005"
        }]
    })
});

app.listen(PORT, () => {
    knex.raw('select 1=1 as test')
        .then(result => {
            console.log('DB CONNECTION: ', result.rows[0].test)
        })
        .catch(err => {
            console.log('ERROR DB:', err)
        });
    console.log("Server started listening on PORT : " + PORT);
});


app.use(morgan('tiny'));
// parsing the request bodys
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
// inisialisasi router
app.use('/v1/', routerV1);

const swaggerUI = require("swagger-ui-express");
const swaggerFile = require('./swagger_output.json');
app.use('/doc', swaggerUI.serve, swaggerUI.setup(swaggerFile));