const mongoose = require('mongoose');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () => {
    console.log('DB Connected');
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Campground.deleteMany({})
  for(let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 100);
    const camp = new Campground({ 
      title: `${sample(places)} ${sample(descriptors)}`,
      price,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      image: 'https://images.unsplash.com/photo-1428447638737-040fa5316956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHw0ODQzNTF8fHx8fHx8MTY5MTAwOTczOQ&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam imperdiet enim tincidunt nulla luctus, eget sagittis nibh tempus. In hac habitasse platea dictumst. Aliquam purus purus, rutrum ac eros sit amet, ultricies tempor metus. Pellentesque in augue enim. Vivamus magna nulla',
    })
    await camp.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close()
});