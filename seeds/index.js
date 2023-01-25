const mongoose = require('mongoose');
const cities = require("./cities");
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.set('strictQuery', false);
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  
  console.log("CONNECTION OPEN!!");
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i<300; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 500000) + 50000;
        const camp = new Campground({
            //특정 사용자 ID
            author: '63b979aa3906455c9ffd61d2',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`, 
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quia natus a doloribus expedita aliquam quasi, rerum nostrum autem ratione. Explicabo aspernatur ad sit dignissimos hic eius velit reprehenderit quis placeat!',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude,
              ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dwr5d4w2u/image/upload/v1673363935/YelpCamp/vix4rmc3ehmptszzbon6.jpg',
                  filename: 'YelpCamp/vix4rmc3ehmptszzbon6'
                },
                {
                  url: 'https://res.cloudinary.com/dwr5d4w2u/image/upload/v1673363937/YelpCamp/gvtdej2nrq9q02eop2y7.jpg',
                  filename: 'YelpCamp/gvtdej2nrq9q02eop2y7'
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})