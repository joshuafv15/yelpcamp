const mongoose = require('mongoose');
const cities = require('./cities');
const Museum = require('../models/museums');
const { places, descriptors } = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/museums', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("We're connencted");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
    await Museum.deleteMany({});
    for (let i = 0; i < 500; i++) {
        const random100 = Math.floor(Math.random() * 100);
        const museum = new Museum({
            author: '60dc7e9a8d45263750939013',
            location: `${cities[random100].city}, ${cities[random100].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore aut repellendus dolorum error tempore officiis, nostrum, totam perferendis nam beatae, illo eaque eveniet tempora. Alias soluta harum adipisci autem fugit",
            price: random100 % 10,
            geometry: {
                "type": "Point",
                "coordinates":
                    [cities[random100].longitude,
                    cities[random100].latitude]
            },
            images: [
                {
                    url: "https://res.cloudinary.com/scenerybubble-yelpcamp/image/upload/v1629207732/YelpCamp/seed1museum_rj9sx1.jpg",
                    filename: "YelpCamp/seed1museum_rj9sx1"
                },
                {
                    url: "https://res.cloudinary.com/scenerybubble-yelpcamp/image/upload/v1629207775/YelpCamp/seed2museum_f0yy16.jpg",
                    filename: "YelpCamp/seed2museum_f0yy16"
                }]
        })
        await museum.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
});

