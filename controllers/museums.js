const Museum = require('../models/museums');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const museums = await Museum.find({});
    res.render('museums/index', { museums });
}


module.exports.renderNewForm = (req, res) => {
    res.render('museums/new');
}

module.exports.showMuseum = async (req, res) => {
    const { id } = req.params;
    const museum = await (await Museum.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author'));
    if (!museum) {
        req.flash('error', "Couldn't find the Museum you're looking for!")
        return res.redirect('/museums');
    }
    res.render('museums/show', { museum });
}

module.exports.renderEditForm = async (req, res) => {
    const museum = await Museum.findById(req.params.id);
    if (!museum) {
        req.flash('error', "Couldn't find the Museum you're looking for!")
        return res.redirect('/museums');
    }
    res.render('museums/edit', { museum });
}

module.exports.updateMuseum = async (req, res) => {
    const { id } = req.params;
    const geoData = await geocoder.forwardGeocode({
        query: req.body.museum.location,
        limit: 1
    }).send()
    const museum = await Museum.findByIdAndUpdate(id, { ...req.body.museum });
    museum.geometry = geoData.body.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    museum.images.push(...imgs);
    await museum.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await museum.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', `Successfully updated Museum!`);
    res.redirect(`/museums/${museum._id}`);
}

module.exports.createMuseum = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.museum.location,
        limit: 1
    }).send()
    const museum = new Museum(req.body.museum);
    museum.geometry = geoData.body.features[0].geometry;
    museum.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    museum.author = req.user._id;
    await museum.save();
    req.flash('success', 'Successfully added a new Museum! ');
    res.redirect(`/museums/${museum._id}`);
}

module.exports.deleteMuseum = async (req, res) => {
    const { id } = req.params;
    await Museum.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted Museum!`);
    res.redirect('/museums');
}