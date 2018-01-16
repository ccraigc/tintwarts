const express = require('express'),
  fileUpload = require('express-fileupload'),
  path = require('path'),
  jimp = require('jimp'),
  colors = require('./colorscheme');

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
        const color = colors[req.body.house];
        let srcImage, size;

        jimp.read(inputDest).then(image => {
            srcImage = image;
            size = { w: image.bitmap.width, h: image.bitmap.height };

            const left = new jimp(size.w / 2, size.h);
            const right = new jimp(size.w / 2, size.h);

            return Promise.all([left, right]);
        }).then(overlayImages => {
            const leftImg = overlayImages[0],
                rightImg = overlayImages[1];

            leftImg.color([{apply:'lighten', params:[100]}]); //,{apply:'mix', params:[color.primary, 100]}]);
            rightImg.color([{apply:'lighten', params:[100]}]); //,{apply:'mix', params:[color.secondary, 100]}]);

            srcImage = leftImg;

            //srcImage.composite(left, 0, 0);
            //srcImage.composite(right, size.w / 2, 0);

            return srcImage.write(outputDest);

            // .color([
            //     { 'apply': 'mix', params: [color.primary, 50] }
            // ])

        }).then(() => {
            res.render('upload', { 'filename': path.join('output', req.files.input.name) });
        }).catch(function (err) {
            return res.status(500).render('error', { 'message': err })
        });
    });
});

app.get('/play', function(req, res) {
    const eep = new jimp(500, 500);
    eep.then(img => {
        img.color([{apply:'lighten', params:[100]}]);
        img.write('cache/output/play.jpg');

        res.send('deno');
    });
});

app.listen(3000);
