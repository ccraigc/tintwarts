const express = require('express'),
  fileUpload = require('express-fileupload'),
  path = require('path'),
  jimp = require('jimp');
  
const app = express();

app.use(fileUpload());
app.use('/output', express.static('cache/output'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/upload', function (req, res) {
    if (!req.files || !req.files.input) {
        return res.status(400).render('error', { 'message': 'Pick an image file!' });
    }

    const inputDest = path.join(__dirname, 'cache/input', req.files.input.name),
        outputDest = path.join(__dirname, 'cache/output', req.files.input.name);

    req.files.input.mv(inputDest, function (err) {
        if (err) console.log('Problem storing file in cache/input/ directory: ', err);

        // apply color to file.
        const overlayFilename = filenameForHouse(req.body.house);

        // read image
        jimp.read(inputDest).then(image => {
            // resize image, read selected overlay
            return Promise.all([image.cover(500, 500).color([
               { 'apply': 'desaturate', 'params': [100] }
            ]), jimp.read(overlayFilename)]);
        }).then(images => {
            // composite images
            const userImage = images[0],
                overlayImage = images[1];

            return userImage.composite(overlayImage, 0, 0);
        }).then(image => {
            // write output
            return image.write(outputDest);
        }).then(img => {
            const safeFilename = encodeURIComponent(req.files.input.name);
            res.redirect('/result?filename='+safeFilename);
        }).catch(function (err) {
            return res.status(500).render('error', { 'message': err })
        });
    });
});

app.get('/result', function (req, res) {
    var filename = req.query.filename;

    res.render('result', { 'filename': path.join('output', filename) });
});

app.listen(process.env.PORT || 3000);

// UTILITY


function filenameForHouse(house) {
    const assetsPath = path.join(__dirname, 'assets');
    let filename;

    switch (house) {
        case 's':
            filename = 'slippysnake.png';
            break;
        case 'g':
            filename = 'flyinglions.png';
            break;
        case 'h':
            filename = 'wheezyhippos.png';
            break;
        case 'r':
        default:
            filename = 'crowhands.png';
    }

    return  path.join(assetsPath, filename);
}
