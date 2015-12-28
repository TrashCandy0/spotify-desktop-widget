var socket = io.connect('http://localhost:3001');
var paused = false;
var currentTrack = {};
var currentTrackMeta = {};
var player = {};
var count = 0;
var trackTemplate = '<div class="track" id="*id*"><div class="play"><a class="media-button media-button-tiny"><i class="fa fa-play"></i></a></div><div class="names"><div class="song">*song*</div><div class="artist">*artist*</div></div><div class="animated playing-icon"></div><div class="duration">*duration*</div></div>';

$("#pause").click(function() {
  paused = !paused;
  if (paused)
      socket.emit('pause');
  else
    socket.emit('play');
});

$("#previous").click(function() {
    socket.emit('prevTrack');
});

$("#next").click(function() {
    socket.emit('nextTrack');
});

$("#shuffle").click(function() {
  socket.emit('shuffle');
});

$("#repeat").click(function() {
  socket.emit('repeat');
});

$("#flip").click(function() {
  $("#flipper").addClass('hover');
});

$("#close").click(function() {
  $("#flipper").removeClass('hover');
});

$("#trackList").on("click", "div.track", function() {
  socket.emit('play', { uri: "spotify:track:" + $(this)[0].id });
});


$(document).ready(function() {
  init();
});

function getTrackHtml(track) {
  console.log(track);
  var trackStr = new String(trackTemplate);
  return trackStr.replace("*id*", track.uri.split(":")[2]).replace("*song*", track.name).replace("*artist*", track.artist).replace("*duration*", getTimeString(track.duration));
}

function highlightCurrentPlaying() {
  $(".playing").removeClass("playing");
  $("#" + currentTrack.uri.split(":")[2]).addClass("playing");
}

function getPlaylist() {
  socket.emit('getPlaylist', null, function(data) {
    var trackArr = "";
    data.tracks.forEach(function(track) {
      trackArr += getTrackHtml(track);
    });
    $("#trackList").html(trackArr);
    $("#playlistName").text(data.name);
    highlightCurrentPlaying();
  });
  var currentTrackItem = $("#" + currentTrack.uri.split(":")[2]);
  if (!currentTrackItem.text()) {
    $("#trackList").prepend(getTrackHtml(currentTrack));
  }
  highlightCurrentPlaying();
}

function updateCoverArt() {
  var trackId = currentTrack.uri.split(":")[2];
  $("#coverArt").attr("style", "");
  $.get("https://api.spotify.com/v1/tracks/" + trackId, function (data) {
    currentTrackMeta = data;
    var image = data.album.images[0].url;
    $("#coverArt").attr("style", "background: linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), url(" + image + ") no-repeat center center;");
    $("#bgArt").attr("style", "background: url(" + image + ") no-repeat center center;");
  });
}

function updateView() {
  $("#name").text(currentTrack.name);
  var artists = currentTrack.artists[0].name;
  for (var i = 1; i < currentTrack.artists.length; i++) {
    artists += ", " + currentTrack.artists[i].name;
  }
  currentTrack.artist = artists;
  $("#artist").text(artists);
  updateCoverArt();
}

function updateMeta() {
  count = 0;
  paused = !player.playing;
  $("#pause i").attr("class", (player.playing) ? "fa fa-pause" : "fa fa-play");
  $("#repeat").attr("class", (player.repeat) ? "fa fa-retweet" : "fa fa-retweet unselected");
  $("#shuffle").attr("class", (player.shuffle) ? "fa fa-random" : "fa fa-random unselected");
  var val = (player.position / player.duration) * 100;
  $("#progress").val(val);
  if(!paused) {
    var count = player.position;
  }
}

setInterval(function() {
  if(!paused) {
    count += 1000;
    updateProgress();
  }
}, 990);

function formatSeconds(num) {
  return ('0' + num).substr(-2);
}

function getTimeString(duration) {
  var seconds = duration / 1000;
  var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
  var numseconds = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
  return numminutes + ":" + formatSeconds(numseconds);
}

function updateTimeCode() {
  $("#elapsed").text(getTimeString(player.position + count));
  $("#duration").text(getTimeString(player.duration));
}

function updateProgress() {
  var newVal = ((player.position + count) / player.duration) * 100;
  updateTimeCode();
  var buf = 0;
  $("#progress").val(newVal);
  $("#progress").css(
    'background',
    'linear-gradient(to right, #0d0e5a 0%, #0d0e5a ' + newVal + '%, #eee ' + newVal + '%, #eee ' + buf + '%, #eee ' + buf + '%, #eee 100%)'
  );
}

$("#progress").click(function() {
  count = 0;
  var val = $(this).val();
  socket.emit('seek', val / 100);
});

function init() {
  socket.emit('sync', null, function(data) {
    changed(data);
  });
}

function changed(data) {
  player = data;
  if (data.track.uri !== currentTrack.uri) {
    currentTrack = data.track;
    updateView();
    getPlaylist();
  }
  updateMeta();
  count = 0;
  updateProgress();
}

socket.on('player.change', function(data) {
  changed(data);
});
