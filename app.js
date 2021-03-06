
var express = require('express');
var socket = require('socket.io');
var os = require('os');
var replacestream = require('replacestream');
var fs = require('fs');
var path = require('path');
//var mail = require('nodemailer');

//Read server ip
var ifaces=os.networkInterfaces();
var ips = [];
for (var dev in ifaces) {
  var alias=0;
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
      ips.push(details.address);
      ++alias;
    }
  });
}
var ip = ips.filter(function(d) {
  return d != '127.0.0.1';
})[0];
var port = 8080;

//Mailing, experimental
/*
let transport = {
    host: 'smtp.live.com',
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: 'vasquez-12@live.com',
        pass: 'dF8gsn96FlCa'
    }
};

var message = {
    from: 'vasquez-12@gmail.com',
    to: 'jvsqzj@gmail.com',
    subject: 'Connecto to ' + ip,
    text: 'Connect to this!',
    html: '<p><a href=http://'+ ip + ':8080</p>'
};

let transporter = mail.createTransport(transport);

transporter.sendMail(message);
*/

//App setup
var app = express();

var server = app.listen(8080, ip, function(){
    console.log('listenting to requests on: '+ ip +':'+port);
});

function handler (req, res) {
    res.writeHead(200);
    var readStream = fs.createReadStream(__dirname + '/public/index.html')
      .pipe(replacestream('<<IP>>', ip ))
      .pipe(res);
  }

//Static files
app.use(express.static('public'));


var io = socket(server);

// Make two lists of writable streams, one for the motions of all
// connected devices, and one for the orientations
var streams = {
    'motion': {},
    'orientation': {}
  };
  
  // getStream('faceup','motion') will return a write stream
  // for the faceup-motion.txt file in the data directory.
  // If stream is already open, add it to the global variable
  // 'streams'. If not, create the stream and add it to the list.
  var getStream = function (name, tp) {
    if (typeof streams[tp][name] !== 'undefined') {
      return streams[tp][name];
    } else {
      var stream = fs.createWriteStream(path.join('data',name+'-'+tp+'.txt'));
      streams[tp][name] = stream;
      return stream;
    }
  };  

io.on('connection', function(socket){
    console.log('New socket connection made at', socket.id);
    socket.on('ip', function(data){
        console.log(data);
        socket.emit('update', data);
    });

    socket.on('break', function(data){
        console.log(data);
    });

    socket.on('orientation',function(data){
        var stream = getStream(data.sender,'orientation');
        console.log(' ' + data.beta + "\n");
    });
});





