if (process.env.NODE_ENV !== 'production') { require('dotenv').config(); }
/*================== // ==================*/ // Server
const express = require('express');
const { Server: HttpServer } = require('http');
const { Server: IOServer } = require('socket.io');
/*================== // ==================*/ // Initialization
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);
/*================== // ==================*/ // Libraries / etc
const exphbs = require('express-handlebars');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
/*===== // =====*/ // Messages model
const { Sqlite } = require('./utils/config');
const messagesTable = 'messages';
const passport = require('passport');
const { Strategy } = require('passport-facebook');
const FacebookStrategy = Strategy;

/*================== // ==================*/ // Middlewares
/* // */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('json spaces', 8);
app.use(cors());
app.use(morgan('dev'));
/*================== // ==================*/ // Engines - Utils
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine(
  'hbs',
  exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsdir: path.join(app.get('views'), 'partials'),
    helpers: {
      section: function(name, options){
        if(!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
      },
    }
  })
);
app.set('view engine', 'hbs');
/*================== // ==================*/ // Routes
const productsRoutes = require('./Router/products.routes');
const userRoutes = require('./Router/userRoutes.routes.js');
const Model = require('./Daos/mensajes/Sqlite.js');
const Message = new Model(Sqlite, messagesTable);
//============ API Routes ===========// // API
/*                                   */
app.use('/api', productsRoutes);
app.use('/api', userRoutes);
app.get('/formulario');
//=========  Client Routes  =========// // API
/*                                   */
app.get('/', (req, res) => { res.render('home');});

//============ Socket IO ============//
io.on('connection', (socket) =>{

  socket.on('products:send', (data) => { // => Recibo producto
    io.sockets.emit('products:send', data); // => Devuelvo producto
  });

  socket.on('chat:message', (data) => { // => Recibo el Mensaje
    Message.saveMessage(data);
    io.sockets.emit('chat:message', data); // => Devuelvo el Mensaje
  });

  /*Messages*/
  socket.on('chat:typing', (data) => { // => Recibo el usuario
    socket.broadcast.emit('chat:typing', data); // => Devuelvo el usuario
  });
  
});

/*====== Mensajes ======*/ 
// => Create Table
//app.get('/mensajes', (req, res) => {Message.createTable(req, res); });
// => GET
app.get('/mensajes',  (req, res ) => { Message.getMessages(req, res); });
// => DELETE
//app.get('/mensajes', (req, res) => { Message.deletetable(req, res); });

//=============================================================== Clase 22  ===============================================================//
//============ Faker.JS ============//
/*===== // =====
const {faker} = require('@faker-js/faker');
/*===== // =====
app.use('/api/productos-test/', (req, res) => { res.render('test'); });
/*===== // =====
faker.locale = 'es';
let getName = () => { return faker.commerce.productName(); };
let getPrice = () => { return faker.commerce.price(); };
let getImage = () => { return faker.image.image(); };

app.use('/api/productos-get', (req, res) => {
  const prod = [
    { title: getName(), price: `$${getPrice()}`, img: getImage(), },
    { title: getName(), price: `$${getPrice()}`, img: getImage(), },
    { title: getName(), price: `$${getPrice()}`, img: getImage(), },
    { title: getName(), price: `$${getPrice()}`, img: getImage(), },
    { title: getName(), price: `$${getPrice()}`, img: getImage(), },
  ];
  res.send(prod);
});
//=============================================================== Clase 24  ===============================================================*/
/* // */
//=============================================================== Clase 26  ===============================================================*/
/* Passport */
passport.use(new FacebookStrategy({clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'displayName', 'photos', 'email']
}, function(accessToken, refreshToken, profile,cb){
  console.log('Datos perfil:', profile);
  return cb(null, profile);
} ));
passport.serializeUser((user, cb) => { cb(null, user); });
passport.deserializeUser((obj, cb) => { cb(null, obj); });

/*Rutas*/
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/datos',
  failureRedirect: '/login',
}));

var authenticate = function() {
  return function (req, res, next) {
    req.isAuthenticated();
    next();
  };
};

app.get('/datos', function(req, res){
  if(authenticate){
    if(!req.user.contador){
      req.user.contador = 0;
    }
    req.user.contador++;

    const datosUsuario = {
      nombre: req.user.displayName,
      foto: req.user.photos[0].value,
      email: req.user.email,
    };

    res.render('datos', {contador: req.user.contador, datos: datosUsuario});
  }
});
app.get('/login', (req, res) =>{
  res.render('facebook-login.hbs');
});

var logout = function() {
  return function (req, res, next) {
    req.logout();
    req.redirect('/login');
    delete req.session;
    next();
  };
};

app.get('/logout', logout);


//--------------------------------- Server ---------------------------------//
const server = httpServer.listen(app.get('port'), () => { console.log('Server on port', app.get('port')); });
server.on('error',error => { console.log('Error en el servidor', error); });

