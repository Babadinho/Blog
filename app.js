var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var hbs = require('hbs');
const bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
const moment = require('moment');

const { checkSchema } = require('express-validator');

const { globalVariable } = require('./config/defaultConfig');
const passport = require('passport');
require('./config/passport')(passport);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users/user');
let authenticationRouter = require('./routes/authentication/register');
let adminRouter = require('./routes/admin/index');
let categotyRouter = require('./routes/admin/category');
let postRouter = require('./routes/admin/post');
let commentRouter = require('./routes/admin/comment');
let singlePostRouter = require('./routes/single');
let singleCatRouter = require('./routes/singleCat');
let emailRouter = require('./routes/admin/email');
let resetPassword = require('./routes/reset');
require('dotenv').config();

var session = require('express-session');
var flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);

var app = express();

app.use('/images', express.static(path.join(__dirname, 'images')));

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Connection Success!'))
  .catch((err) => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(session({ secret: 'secret' }));

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.use(flash());

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(globalVariable);

//Registering Partials
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerPartials(__dirname + '/views/partials/admin');
hbs.registerPartials(__dirname + '/views/partials/user');

hbs.registerHelper({
  eq: (v1, v2) => v1 === v2,
  ne: (v1, v2) => v1 !== v2,
  lt: (v1, v2) => v1 < v2,
  gt: (v1, v2) => v1 > v2,
  lte: (v1, v2) => v1 <= v2,
  gte: (v1, v2) => v1 >= v2,
  and() {
    return Array.prototype.every.call(arguments, Boolean);
  },
  or() {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  },
});

hbs.registerHelper({
  formatDate: function (date, format) {
    return moment(date).utc().format(format);
  },
  truncate: function (str, len) {
    if (str.length > len && str.length > 0) {
      let new_str = str + ' ';
      new_str = str.substr(0, len);
      new_str = str.substr(0, new_str.lastIndexOf(' '));
      new_str = new_str.length > 0 ? new_str : str.substr(0, len);
      return new_str + '...';
    }
    return str;
  },
});

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/account', authenticationRouter);
app.use('/admin', adminRouter);
app.use('/post', postRouter);
app.use('/category', categotyRouter);
app.use('/comments', commentRouter);
app.use('/post', singlePostRouter);
app.use('/category', singleCatRouter);
app.use('/', emailRouter);
app.use('/password', resetPassword);

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use(
  checkSchema({
    customValidators: {
      isImage: function (value, filename) {
        var extension = path.extname(filename).toLowerCase();
        switch (extenion) {
          case '.jpg':
            return '.jpg';
          case '.png':
            return '.png';
          case '.jpeg':
            return '.jpeg';
          case '':
            return '.jpg';
          default:
            return false;
        }
      },
    },
  })
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
