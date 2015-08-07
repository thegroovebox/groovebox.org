
var queue, queueSong, queueExport, queueClear;
var getQueueSong, playSong, stopSong, nextSong, songStopped, toggleRepeat;

(function() {
  'use strict';

  toggleRepeat = function() { queue.repeat = !queue.repeat; }
  var setPosition = function(pos) {
    queue.pos = pos
    $('#playbox #history ul.queue li.selected').removeClass('selected');
    $('#playbox #history ul.queue li').eq(queue.pos).addClass('selected');
  }
  var media_srv = "https://archive.org/download/";

  queue = {
    pos: 0, // the index of the queue
    pop: true, // remove after playing
    repeat: false,
    shuffle: false,
    startover: false,
    length: function() { return $('#playbox #history ul.queue li').length },
    select: setPosition
  };

  /* Returns the track at index within the play queue */
  getQueueSong = function(index) {
    var $this = $('#playbox #history ul.queue li').eq(index);
    return Track.extract($this);
  }

  songStopped = function() {
    return $('#audio-player')[0].paused;
  }

  nextSong = function() {
    if (queue.repeat) {
      playSong(getQueueSong(queue.pos));
    }
    queue.select((queue.pos + 1) % queue.length());
    if (queue.pos > 0 || (queue.pos === 0 && queue.startover)) {
      playSong(getQueueSong(queue.pos));
    } else {
      $('#playbox #history ul.queue li.selected').removeClass('selected');
    }
  }

  queueSong = function(track) {
    $('#playbox #history ul.queue').append(
      '<li artist="' + track.artist + '" concert="' + track.concert
        + '" song="' + track.song +'" title="' + track.title 
        + '" sid="' + track.sid + '" aid="' + track.artist.tag + '">'
        + '<span class="track-play">' + track.title + '</span>'
        + '<span class="track-remove"><i class="fa fa-times-circle"></i></span>'
        + '<span class="track-remove"><i class="fa fa-times-circle"></i></span>'
        + '<div class="track-artist"><span>' + track.artist +  '</span></div>'
        + '</li>'
    );
    return queue.length()-1;
  }

  queueExport = function (){
    var sids = [];
    $('#playbox #history ul.queue li').each(function(){
      sids.push($(this).attr('sid'));
    });
    prompt("Here's a link to your groovebox playlist!",
           window.location.hostname + "?queue=" + sids.join());
  }

  queueClear = function() {
    stopSong();
    queue.pos = 0;
    $('#playbox #history ul.queue li.selected').removeClass('selected');
    $('#playbox #history ul.queue').empty();
  }

  playSong = function(track) {
    //XXX use /api to get metadata coverart -- open issue    
    var src = $('#resultsbox .coverart img').attr('src');
    var url = media_srv + track.concert + "/" + track.song;
    $('#nowplaying .album-cover img').attr("src", src);
    $('#nowplaying .song-title').text(track.title);
    $('#nowplaying .song-artist').text(track.artist);
    $('#audio-player source').attr("src", url);
    $('#audio-player')[0].pause();
    $('#audio-player')[0].load();
    $('#audio-player')[0].play();
  }

  stopSong = function() {
    $('#audio-player')[0].pause();
    $('#audio-player source').attr("src", "");    
    $('#audio-player')[0].load();
  }

}());
