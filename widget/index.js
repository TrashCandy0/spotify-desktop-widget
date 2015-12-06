var socket = io.connect('http://localhost:3001');
var paused = false;
var currentTrack = {};
var currentTrackMeta = {};
var player = {};
var count = 0;

$("#pause").click(function() {
  paused = !paused;
  if (paused)
      socket.emit('pause');
  else
    socket.emit('play');
});

function updateCoverArt() {
  var trackId = currentTrack.uri.split(":")[2];
  $.get("https://api.spotify.com/v1/tracks/" + trackId, function (data) {
    currentTrackMeta = data;
    var image = data.album.images[0].url;
    $("#coverArt").attr("src", image);
  });
}

function updateView() {
  $("#name").text(currentTrack.name);
  var artists = currentTrack.artists[0].name;
  for (var i = 1; i < currentTrack.artists.length; i++) {
    artists += ", " + currentTrack.artists[i].name;
  }
  $("#artist").text(artists);
  updateCoverArt();
}

function updateMeta() {
  count = 0;
  paused = !player.playing;
  $("#pause").val((player.playing) ? "Pause" : "Play");
  var val = (player.position / player.duration) * 100;
  $("#progress").val(val);
  if(!paused) {
    var count = player.position;
  }
}

setInterval(function() {
  if(!paused) {
    var newVal = ((player.position + count) / player.duration) * 100;
    $("#progress").val(newVal);
    $("#progress").css(
      'background',
      'linear-gradient(to right, #cc181e 0%, #cc181e ' + newVal + '%, #777 ' + newVal + '%, #777 ' + 0 + '%, #444 ' + 0 + '%, #444 100%)'
    );
    count += 1000;
  }
}, 1000);

$("#progress").click(function() {
  count = 0;
  var val = $(this).val();
  socket.emit('seek', val / 100);
});

function changed(data) {
  player = data;
  updateMeta();
  if (data.track.uri !== currentTrack.uri) {
    currentTrack = data.track;
    updateView();
  }
}

socket.on('player.change', function(data) {
  changed(data);
  console.log(data);
});
