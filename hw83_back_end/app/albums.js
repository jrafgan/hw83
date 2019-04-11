const express = require('express');
const multer = require('multer');
const path = require('path');
const nanoid = require('nanoid');
const config = require('../config');
const Album = require('../models/Album');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, nanoid() + path.extname(file.originalname));
    }
});

const upload = multer({storage});

router.get('/', (req, res) => {

    if (req.query.artist) {

        Album.find().populate('artist').then(albums => {
            const result = [];
            albums.map(item=>{
                if (item.artist._id == req.query.artist) {
                    result.push(item);
                }
            });

            if (albums) res.send(result);
            else res.sendStatus(404);
        }).catch(() => res.sendStatus(500));
    } else {
        Album.find().populate('artist')
            .then(artists => res.send(artists))
            .catch(() => res.sendStatus(500));
    }
});

router.get('/:id', (req, res) => {

        Album.findOne({_id: req.params.id}).populate('artist').then(album => {
            if (album) res.send(album);
            else res.sendStatus(404);
        }).catch(() => res.sendStatus(500));
});


router.post('/', upload.single('image'), (req, res) => {
    const albumData = req.body;

    if (req.file) {
        albumData.image = req.file.filename;
    }
    const album = new Album(albumData);
    album.save()
        .then(result => res.send(result))
        .catch(error => res.status(400).send(error));
});

module.exports = router;