const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const ExpressError = require('./utilities/ExpressError');
const catchAsync = require('./utilities/catchAsync');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () => {
    console.log('DB Connected');
})

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})
app.post('/campgrounds', catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            // price: Joi.location().required(),
        }).required()
     })
    const { error } =  campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }
    console.log('---------->', results, '--------END-----------');
    const campground = new Campground(req.body.campground)
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground})
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id', catchAsync(async(req, res, next) => {
    try {
        const { id } = req.params;
        await Campground.findByIdAndUpdate(id, req.body.campground)
        res.redirect(`/campgrounds/${id}`)
    } catch (e) {
        next(e)
    }
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err
    if(!err.message) err.message = 'Oh no, something went wrong'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Listening on server 3000');
})
