if(process.env.NODE_ENV !== "production"){
  require('dotenv').config()
}

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const { scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUrls } = require("./utils/helmetConfig");
const MongoStore = require('connect-mongo')
const port = process.env.PORT || 3000

const dbUrl = process.env.DATABASE_URL

const userRoutes = require("./routes/users")
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")

// Fix deprecated mongoose
mongoose.set("strictQuery", false);

mongoose.connect(dbUrl)

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"))
// db.once("open", () => {
//   console.log("Database Connected")
// });

const app = express()

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")))
app.use(mongoSanitize({
  replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60
})

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig))
app.use(flash())

app.use(
  helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: {
          allowOrigins: ['*']
      },
      contentSecurityPolicy: {
          directives: {
            defaultSrc: ['*'],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
              "'self'",
              "blob:",
              "data:",
              `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
              "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
          }
      }
  })
)

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  res.locals.currentUser = req.user
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  next()
});

app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)

app.get("/", (req, res) => {
  res.render("home")
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found!", 404))
});

// 404 & other handling middleware at the end of the file if routes are not found
app.use((error, req, res, next) => {
  const { statusCode = 500 } = error;
  if (!error.message) error.message = "Oh no, something went wrong!";
  res.status(statusCode).render("error", { error });
});

// app.listen(port, () => {
//   console.log(`Listening on Port ${ port }`);
// });

main().catch((err) => console.log(err));
async function main() {
	mongoose.connect(dbUrl);
	console.log("Connection open!");
	// Starting up app on desired port
	app.listen(port, () => {
		console.log(`Serving on http://localhost:${port}`);
	});
}
