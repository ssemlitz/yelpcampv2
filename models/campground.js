const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,    
  filename: String,
})

ImageSchema.virtual('thumbnail').get(function() {
  // if (this.url) {
    return this.url.replace('/upload', '/upload/w_200')
  // } else {
  //   return "https://res.cloudinary.com/dudoovhhx/image/upload/w_200/v1675180412/YelpCamp/JLCG_tents_Teewinot_2008_mattson_1_senv28.jpg"
  // }
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  state: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User' 
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
  let thumbnail = null
  if (this.images.length) {
    thumbnail = this.images[0].thumbnail
  } else {
    thumbnail = "https://res.cloudinary.com/dudoovhhx/image/upload/w_200/v1675180412/YelpCamp/JLCG_tents_Teewinot_2008_mattson_1_senv28.jpg"
  }
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>  
  <img src="${thumbnail}" width="50">`
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
})

module.exports = mongoose.model('Campground', CampgroundSchema)

// 'https://res.cloudinary.com/dudoovhhx/image/upload/v1675180412/YelpCamp/JLCG_tents_Teewinot_2008_mattson_1_senv28.jpg'