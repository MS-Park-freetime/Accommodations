//cloudinary
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
// console.log(process.env.SECRET)
// console.log(process.env.API_KEY)

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

const MongoStore = require('connect-mongo');

const { deserialize } = require('v8');
const { deserializeUser } = require('passport');

mongoose.set('strictQuery', false);
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(dbUrl);
    //'mongodb://127.0.0.1:27017/yelp-camp'
    console.log("CONNECTION OPEN!!");
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
//sql injection
app.use(mongoSanitize({replaceWith: '_'}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function(e){
    console.log("session store error", e);
})

//쿠키
const sessionConfig = {
    store,
    //사람들의 세션정보를 훔쳐서는 본인인척 로그인을 할 수 있음.
    //그래서 기본값이 아닌 이름으로 하되 사람들이 모를만한 것으로 설정
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: { //HTTP를 통해서만 쿠키가 작동하도록함.
        httpOnly: true,
        //secure: true,
        //일주일 후 만료
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());//{contentSecurityPolicy: false}꺼놓지 않으면 많은 곳에서 오류가 발생할것

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dwr5d4w2u/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// app.use(
//     helmet({
//         crossOriginEmbedderPolicy: false,
//         crossOriginResourcePolicy: {
//             allowOrigins: ['*']
//         },
//         contentSecurityPolicy : {
//             directives: {
//                 defaultSrc: ['*'],
//                 connectSrc: ["'self'", ...connectSrcUrls],
//                 scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//                 styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//                 workerSrc: ["'self'", "blob:"],
//                 objectSrc: [],
//                 imgSrc: [
//                     "'self'",
//                     "blob:",
//                     "data:",
//                     "https://res.cloudinary.com/dwr5d4w2u/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                     "https://images.unsplash.com/",
//                 ],
//                 fontSrc: ["'self'", ...fontSrcUrls],
//             },
//         }
//     })
// );    


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//플래시 메세지
app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

/*app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'marilyn@naver.com', username: 'marilyn'})
    const newUser = await User.register(user, 'chicken')
    res.send(newUser);
})*/

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
})


//get,post..모든요청
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})



app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`PORT ${port}`);
})