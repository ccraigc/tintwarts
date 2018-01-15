const express = require('express'),
  fileUpload = require('express-fileupload'),
  path = require('path'),
  jimp = require('jimp'),
  md5 = require('md5'),
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
    if (!req.files) {
        return res.status(400).send('No file received.');
    }

    const inputImage = req.files.input;
    const cacheName = md5(inputImage.name);

    inputImage.mv(path.join(__dirname,'cache/input', cacheName), function (err) {
        if (err) console.log('Problem storing file in cache/input/ directory: ', err);
    });

    // apply color to file.
});

app.listen(3000);
