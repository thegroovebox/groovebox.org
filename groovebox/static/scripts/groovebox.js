
var history, redux;

(function () {
  'use strict';  

  redux = {

  };

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }

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

  var defaultCoverArt = "https://archive.org/19/items/internetarchivebooks/archive-logo-300.png";

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

  var getJsonFromUrl = function () {
    var query = location.search.substr(1);
    var result = {};
    query.split("&").forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
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



  var renderTracks = function(tracks) {
    for (var t in tracks) {
      var track = tracks[t];
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
  }

  var populateConcertResults = function(item) {
    var coverArt = item.metadata && item.metadata.coverArt ?
      item.metadata.coverArt : defaultCoverArt;
    $("#resultsbox header h1").text(item.artist);
    $("#resultsbox header h2").text(item.name);
    $("#resultsbox .coverart img").attr('src', coverArt);
    $("#resultsbox .serp-type").text("Concert");
    $("#resultsbox table thead").empty();
    $("#resultsbox table thead").append(
      '<tr>\
           <th>Track</th>\
           <th>Title</th>\
           <th><i class="fa fa-clock-o"></i></th>\
           <th class="play-all"><i class="fa fa-play"></i></th>\
       </tr>'
    );
    renderTracks(item.tracks);
  }

  var populateArtistSongResults = function(artist) {
    var coverArt = artist.avatar || defaultCoverArt;
    $("#resultsbox header h1").text(artist.name);
    $("#resultsbox header h2").text('');
    $("#resultsbox .coverart img").attr('src', coverArt);
    $("#resultsbox .serp-type").text("Artist");
    $("#resultsbox table thead").empty();
    $("#resultsbox table thead").append(
      '<tr>\
           <th>Concert</th>\
       </tr>'
    );
    for (var c in artist.concerts) {
      var concert = artist.concerts[c];
      $('#resultsbox table tbody').append(
        '<tr class="goto-concert" cid="' + concert.id + '" concert="' + concert.tag + '"><td>' + concert.name + '</td></tr>'
      );
    }
  }

  var populateResultsTable = function(item, callback) {
    $("#resultsbox table tbody").empty();
    if (item.concerts) {
      populateArtistSongResults(item);
    } else {
      populateConcertResults(item);
    }

    if (!$('#resultsbox').hasClass('open')) {
      toggleResultsbox();
    }
    if (callback) { callback(); }
  }


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
    var track = Track.extract($this);
    queue.select(queueSong(track));
    playSong(track);
  });

  /* Queue + start playing entire concert */
  $('#resultsbox').on('click', '.play-all', function() {    
    var pos = queue.length();
    $('#resultsbox table tbody tr').each(function() {
      queueSong(Track.extract($(this)));
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
      playSong(Track.extract($this));
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
    queueSong(Track.extract($this));
  });

  /* If ALBUM search result is clicked, load song list in resultsbox
  $('#searchbox-results').on('click', 'section.album ul li', function() {
    var $this = $(this);
    setTimeout(function () {
      var album = new Album($this.attr('aid'));
      album.songs(function(results) {
	toggleSearchbox();
	populateResultsTable(results, function() {
	  
	});
      });
    });
  });
  */

  var populateSearchMatches = function(results, callback) {
    $("#searchbox-results").empty();
    var entities = ['tracks', 'artists', 'albums', 'songs'];
    var artists = results.artists;
    var tracks = results.tracks;
    var songs = results.songs;
    var albums = results.albums;

    // Create list if results of this entity type
    for (var e in entities) {
      var entity = entities[e];
      if (results[entity] && results[entity].length) {
	$('#searchbox-results').append(
	  '<section class="' + entity + '"><span>' + entity.capitalize()
	    + '</span><ul></ul></section>'
	);
      }
    }

    // populate search results for tracks
    for (var t in tracks) {
      var track = tracks[t];
      $('#searchbox-results section.tracks ul').append(
        '<li artist="' + track.artist.name + '" concert="' + track.item_id
          + '" song="' + track.file_id +'" title="' + track.name
          + '" sid="' + track.id + '" aid="' + track.artist.tag 
	  + '" title="' + track.name + '">'
          + '<h2 class="result-track">' + track.name + '</h2>'
          + '<h3 class="result-artist">' + track.artist.name + '</h3>'
          + '</li>'
      );
    }

    // populate search results for artists
    for (var a in artists) {
      var artist = artists[a];
      $('#searchbox-results section.artists ul').append(
        '<li artist="' + artist.name + '" aid="' + artist.tag 
	  + '" title="' + artist.name + '">'
          + '<h2 class="result-artist">' + artist.name + '</h2>'
          + '</li>'
      );
    }




    // populate search results for albums
    for (var a in albums) {
      var album = albums[a];
      $('#searchbox-results section.albums ul').append(
        '<li artist="' + album.artist.name + '" aid="' + album.artist.tag
	  + '" album_id="' + album.id + '" album_name="' + album.name
	  + '" title="' + album.name + '">'
          + '<h2 class="result-track">' + album.name + '</h2>'
          + '<h3 class="result-artist">' + album.artist.name + '</h3>'
          + '</li>'
      );
    }

    // populate search results for songs
    for (var s in songs) {
      var song = songs[s];
      $('#searchbox-results section.songs ul').append(
        '<li artist="' + song.artist.name + '" sid="' + song.id
	  + '" aid="' + song.artist.tag + '" title="' + song.name
	  + '">'
          + '<h2 class="result-track">' + song.name + '</h2>'
          + '<h3 class="result-artist">' + song.artist.name + '</h3>'
          + '</li>'
      );
    }
    if (callback) { callback(); }
  }

  /* If ARTIST search result is clicked, load song list in resultsbox */
  $('#searchbox-results').on('click', 'section.artists ul li', function() {
    var $this = $(this);
    setTimeout(function () {
      var artist = new Artist($this.attr('aid'));
      artist.get(function(band) {
        artist.concerts(function(concerts) {
          band.concerts = concerts;
	  toggleSearchbox();
	  populateResultsTable(band, function() {});
        });

        /*
	artist.songs(function(songs) {
          if (!songs.length) {
            artist.tracks(function(tracks) {
              band.tracks = tracks;
	      toggleSearchbox();
	      populateResultsTable(band, function() {});
            });
          } else {
	    band.songs = songs;
	    toggleSearchbox();
	    populateResultsTable(band, function() {});
          }
	});
        */
      });
    });
  });

  /* Load concert from Artist results */
  $('#resultsbox').on('click', 'tr.goto-concert', function() {
    var $this = $(this);
    setTimeout(function () {
      var concert = new Concert($this.attr('concert'));
      concert.get(function(results) {
        populateResultsTable(results);
      });
    }, 300);
  });

  /* If TRACK search result is clicked, load concert tracks in resultsbox */
  $('#searchbox-results').on('click', 'section.tracks ul li', function() {
    var $this = $(this);
    setTimeout(function () {
      var track = Track.extract($this);
      var concert = new Concert($this.attr('concert'));
      concert.get(function(results) {
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

  /* If ALBUM search result is clicked, load song list in resultsbox */
  $('#searchbox-results').on('click', 'section.albums ul li', function() {
    var $this = $(this);
    setTimeout(function () {
      var album = new Artist($this.attr('album_id'));
      artist.get(function(band) {
	artist.songs(function(songs) {
	  band.songs = songs;
	  toggleSearchbox();
	  populateResultsTable(band, function() {
	  });
	});
      });
    });
  });

  /* If SONG search result is clicked, load tracks in resultsbox */
  $('#searchbox-results').on('click', 'section.songs ul li', function() {
    var $this = $(this);
    setTimeout(function () {
      var song = new Song($this.attr('sid'));
      song.tracks(function(tracks) {
	toggleSearchbox();
	populateResultsTable(band, function() {
	});
      });
    });
  });

  // On search typing
  $('#searchbox-header form').submit(function(event) {
    // bring up more comprehensive results in resultsbox
    event.preventDefault();
  });
  $('#searchbox-header form').keyup(debounce(function(event) {
    search($('#search-query').val(), function(results) {
      populateSearchMatches(results);
    });
  }, 275, false));

  /* If album cover is clicked, load its tracks in resultsbox */
  $('.album-cover').on('click', 'button', function() {    
    var $this = $(this);
    setTimeout(function () {
      var concert = new Concert($this.attr('concert'));
      concert.get(function(results) {
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

    // [ISSUE] https://webarchive.jira.com/browse/GROOVE-1
    for (var sid in options.queue) {      
      // XXX fix song miss-ordering caused by .get
      var t = new Track(options.queue[sid]);
      t.get(function(track) {
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
