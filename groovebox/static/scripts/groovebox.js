var getJsonFromUrl = function () {
  var query = location.search.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

var debounce = function (func, threshold, execAsap) {
  var timeout;

  return function debounced () {
    var obj = this, args = arguments;
    function delayed () {
      if (!execAsap)
        func.apply(obj, args);
      timeout = null;
    };

    if (timeout)
      clearTimeout(timeout);
    else if (execAsap)
      func.apply(obj, args);

    timeout = setTimeout(delayed, threshold || 100);
  };
}

var playSong, stopSong, nextSong, songStopped, toggleRepeat;
var queueSong, queueExport, queueClear;
var getGenreArtists, getArtist, getAlbum, getConcert, getSong, getTrack;

(function () {
  'use strict';  
  var apiurl = "https://api.groovebox.org/api";
  var baseurl = "https://archive.org/download/";
  var defaultCoverArt = "https://ia600606.us.archive.org/19/items/internetarchivebooks/archive-logo-300.png";
  var extractTrack = function($this) {
    return {
      artist: $this.attr('artist'),
      aid: $this.attr('aid'),
      concert: $this.attr('concert'),
      song: $this.attr('song'),      
      title: $this.attr('title'),
      sid: $this.attr('sid')
    }
  };

  toggleRepeat = function() { queue.repeat = !queue.repeat; }
  var setPosition = function(pos) {
    queue.pos = pos
    $('#playbox #history ul.queue li.selected').removeClass('selected');
    $('#playbox #history ul.queue li').eq(queue.pos).addClass('selected');
  }
  var queue = {
    pos: 0, // the index of the queue
    pop: true, // remove after playing
    repeat: false,
    shuffle: false,
    startover: false,
    length: function() { return $('#playbox #history ul.queue li').length },
    select: setPosition
  };

  /* Returns the track at index within the play queue */
  var getQueueSong = function(index) {
    var $this = $('#playbox #history ul.queue li').eq(index);
    return extractTrack($this);
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
    var url = baseurl + track.concert + "/" + track.song;
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

  var toggleSearchbox = function() {
    $('#blur-search').fadeToggle(500);
    $('#searchbox input').focus();
    if ($('#searchbox').hasClass('open')) {
      $('#searchbox').removeClass('open');
    } else {
      $('#searchbox').addClass('open');
    }
  };

  var toggleResultsbox = function() {
    $('#blur-results').fadeToggle(500);
    $('#results-toggler').show();
    if ($('#resultsbox').hasClass('open')) {
      $('#resultsbox').removeClass('open');
      $('#results-toggler .expand-arrow i').removeClass('fa-rotate-180');
    } else {
      $('#resultsbox').addClass('open');
      $('#results-toggler .expand-arrow i').addClass('fa-rotate-180');
    }
  };

  var toMinutes = function(seconds) {
    // Some songs, like mp3, are already in duration of minutes.
    if (isNaN(seconds)) {
      if (seconds.indexOf(':') != -1) {
        return seconds;
      }
      seconds = parseInt(seconds);
    }
    return (Math.floor(seconds / 60) + ((seconds % 60) / 100))
      .toFixed(2).toString().replace('.', ':');
  }

  var search = function(query, callback) {
    var url = apiurl + '/search?q=' + query;
    $.get(url, function(results) {
    }).done(function(data) {
      if (callback) { callback(data); }
    });
  }

  getGenreArtists = function(artist, callback) {
    var url = apiurl + '/genres/' + genres + '?artists=1';
    $.get(url, function(results) {
    }).done(function(data) {
      if (callback) { callback(data); }
    });    
  }

  getArtist = function(artist, callback) {
    var url = apiurl + '/artists/' + artist;
    $.get(url, function(results) {
    }).done(function(data) {
      if (callback) { callback(data); }
    });    
  }

  getAlbum = function(artist, callback) {
    var url = apiurl + '/artists/' + artist + '/albums/' + concert;
    $.get(url, function(results) {
    }).done(function(data) {
      if (callback) { callback(data); }
    });
  }

  getConcert = function(artist, concert, callback) {
    var url = apiurl + '/artists/' + artist + '/concerts/' + concert;
    $.get(url, function(results) {
    }).done(function(data) {
      if (callback) { callback(data); }
    });
  }

  getTrack = function(track_id, callback) {
    var url = apiurl + '/tracks/' + track_id;
    $.get(url, function(results) {
    }).done(function(data) {
      if (callback) { callback(data); }
    });
  }

  var populateSearchMatches = function(results, callback) {
    $("#searchbox-results ul").empty();
    var artists = results.artists;
    var tracks = results.tracks;
    for (var t in tracks) {
      var track = tracks[t];
      $('#searchbox-results ul').append(
        '<li artist="' + track.artist.name + '" concert="' + track.item_id
          + '" song="' + track.file_id +'" title="' + track.name
          + '" sid="' + track.id + '" aid="' + track.artist.tag + '">'
          + '<h2 class="result-track">' + track.name + '</h2>'
          + '<h3 class="result-artist">' + track.artist.name + '</h3>'
          + '</li>'
      );
    }
    if (callback) { callback(); }
  }

  var populateResultsTable = function(item, callback) {
    var coverArt = item.metadata && item.metadata.coverArt ?
      item.metadata.coverArt : defaultCoverArt;
    $("#resultsbox table tbody").empty();
    $("#resultsbox header h1").text(item.artist);
    $("#resultsbox header h2").text(item.name);
    $("#resultsbox .coverart img").attr('src', coverArt);
    
    for (var t in item.tracks) {
      var track = item.tracks[t];
      $('#resultsbox table tbody').append(
        '<tr artist="' + track.artist.name + '" concert="' + track.item_id
          + '" song="' + track.file_id +'" title="' + track.name
          + '" sid="' + track.id + '" aid="' + track.artist.tag + '">'
          +'<td class="playable">' + track.number + '</td>'
          +'<td class="playable">' + track.name + '</td>'
          +'<td class="playable">' + toMinutes(track.length) + '</td>'
          +'<td class="track-queue"><i class="fa fa-plus-circle"></i></td>'
          + '</tr>'
      );
    }

    if (!$('#resultsbox').hasClass('open')) {
      toggleResultsbox();
    }
    if (callback) { callback(); }
  }

  // On search typing
  $('#searchbox-header form').submit(function(event) { event.preventDefault(); });
  $('#searchbox-header form').keyup(debounce(function(event) {
    search($('#search-query').val(), function(results) {
      populateSearchMatches(results);
    });
  }, 200, false));

  $('#blur-search').click(function() {
    if($('#searchbox').hasClass('open')) {
      toggleSearchbox();
    }
  });

  $('#blur-results').click(function() {
    if ($('#resultsbox').hasClass('open')) {
      toggleResultsbox();
    }
  });

  $('#search').click(function() { 
    toggleSearchbox();
  });

  /* Queue and immediately play track from track results */
  $('#resultsbox').on('click', 'tr td.playable', function() {
    var $this = $(this).closest('tr');
    var track = extractTrack($this);
    queue.select(queueSong(track));
    playSong(track);
  });

  /* Queue + start playing entire concert */
  $('#resultsbox table thead').on('click', 'th.play-all', function() {    
    var pos = queue.length();
    $('#resultsbox table tbody tr').each(function() {
      queueSong(extractTrack($(this)));
    }).promise().done(function() {
      if(songStopped()) {
        var index = pos ? pos + 1 : pos;
        queue.select(index);
        playSong(getQueueSong(index));
      }
    });   
  });

  /* Play song from queue */
  $('#playbox #history ul.queue')  
    .on('click', 'li', function() {
      var $this = $(this).closest('li');
      queue.select($this.index('#playbox #history ul.queue li'));
      playSong(extractTrack($this));
    });

  /* dequeue song*/
  $('#playbox #history ul.queue').on('click', 'li span.track-remove', function(event) {
    event.stopPropagation();
    var $this = $(this).closest('li');
    var index = $this.index('#playbox #history ul.queue li');
    $this.remove()

    if (queue.pos === index) {      
      stopSong();
      if(queue.pos === (queue.length()-1)) {
        queue.select(queue.pos % (queue.length()-1));
      }
    } else {
      // if the song is before current queue.pos, update pos
      if (index < queue.pos) {
        queue.select(queue.pos - 1);
      }
    }
  });
 
  /* If track '+' clicked in resultsbox, add to queue */
  $('#resultsbox table tbody').on('click', 'tr td.track-queue', function() {
    var $this = $(this).closest('tr');
    queueSong(extractTrack($this));
  });

  /* If search result is clicked, play song and/or load concert tracks in resultsbox */
  $('#searchbox-results ul').on('click', 'li', function() {
    var $this = $(this);
    setTimeout(function () {
      var track = extractTrack($this);
      var artist = $this.attr('aid');
      var concert = $this.attr('concert');
      getConcert(artist, concert, function(results) {
        toggleSearchbox();
        populateResultsTable(results, function() {
          var sel = '#resultsbox table tbody tr[sid=' + track.sid + ']';
          var searchedSong = $(sel).position();
          $('#resultsbox').animate({scrollTop: searchedSong.top}, 600);
          $(sel).addClass("selected");
        });
      });
    }, 300);
  });

  /* If album cover is clicked, load its tracks in resultsbox */
  $('.album-cover').on('click', 'button', function() {    
    var $this = $(this);
    setTimeout(function () {
      var artist = $this.attr('artist');
      var concert = $this.attr('concert');
      getConcert(artist, concert, function(results) {
        populateResultsTable(results);
      });
    }, 300);
  });

  $('#results-toggler').click(function() {
    toggleResultsbox();
  })

  /* Parse GET parameters */
  var options = getJsonFromUrl();
  if (options.queue) {
    options.queue = options.queue.split(",");
    var idx = 0;
    for (var sid in options.queue) {      
      // XXX fix song miss-ordering caused by .get
      getTrack(options.queue[sid], function(track) {
        var song = {
          artist: track.artist.name,
          aid: track.artist.tag,
          concert: track.item_id,
          song: track.file_id,
          title: track.name,
          sid: track.id
        };
        idx ? queueSong(song) : playSong(getQueueSong(queueSong(song)));
        idx += 1;
      });      
    }
  }

}());
