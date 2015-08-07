
var Artist, Genre, Album, Concert, Song, Track, search;

(function() {
  var apiurl = "https://api.groovebox.org";

  search = function(query, callback) {
    var url = apiurl + '/search?q=' + query;
    $.get(url, function(results) {
    }).done(function(data) {
      if (callback) { callback(data); }
    });
  }

  Artist = function(id) {
    this.id = id;
  };
  Artist.all = function(callback, options) {
    var url = apiurl + '/artists';
    $.get(url, options || {}, function(results) {
    }).done(function(data) {
      if (callback) { callback(data); }
    });    
  };
  Artist.prototype = {
    get: function(callback) {
      var url = apiurl + '/artists/' + this.id;
      $.get(url, function(results) {
      }).done(function(data) {
	if (callback) { callback(data); }
      });
    },

    albums: function(callback) {
      var url = apiurl + '/artists/' + this.id + '/albums';
      $.get(url, function(results) {
      }).done(function(data) {
	if (callback) { callback(data); }
      });
    },

    songs: function(callback) {
      var url = apiurl + '/artists/' + this.id + '/songs';
      $.get(url, function(results) {
      }).done(function(data) {
	if (callback) { callback(data); }
      });
    }
  };


  Album = function(id) {
    this.id = id;
  };
  Album.prototype = {
    get: function(callback) {
      var url = apiurl + '/albums/' + this.id;
      $.get(url, function(results) {
      }).done(function(data) {
	if (callback) { callback(data); }
      });
    }
  };

  Concert = function(tag) {
    this.id = tag;
  };
  Concert.prototype = {
    get: function(callback) {
      var url = apiurl + '/concerts/' + this.id;
      $.get(url, function(results) {
      }).done(function(data) {
	if (callback) { callback(data); }
      });
    }
  };

  Track = function(tag) {
    this.id = tag;
  };
  Track.extract = function(track) {
    return {
      artist: track.attr('artist'),
      aid: track.attr('aid'),
      concert: track.attr('concert'),
      song: track.attr('song'),      
      title: track.attr('title'),
      sid: track.attr('sid')
    };
  };
  Track.prototype = {
    get: function(callback) {
      var url = apiurl + '/tracks/' + this.id;
      $.get(url, function(results) {
      }).done(function(data) {
	if (callback) { callback(data); }
      });
    }
  };

  Genre = function(id) {
    this.id = id;
  };
  Genre.prototype = {
    get: function(callback) {
      var url = apiurl + '/genre/' + this.id;
      $.get(url, function(results) {
      }).done(function(data) {
	if (callback) { callback(data); }
      });
    },

    songs: function(callback) {
      var url = apiurl + '/genre/' + this.id + '/songs';
      $.get(url, function(results) {
      }).done(function(data) {
	if (callback) { callback(data); }
      });
    }
  };

  Song = function(id) {
    this.id = id;
  };
  Song.prototype = {
    get: function(callback) {
      var url = apiurl + '/songs/' + this.id;
      $.get(url, function(results) {
      }).done(function(data) {
	if (callback) { callback(data); }
      });
    },

    tracks: function(callback) {
      var url = apiurl + '/songs/' + this.id + '/tracks';
      $.get(url, function(results) {
      }).done(function(data) {
	if (callback) { callback(data); }
      });
    }
  };
}());
