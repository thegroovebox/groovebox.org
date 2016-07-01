
var Artist, Genre, Album, Concert, Song, Track, search;

(function() {
  var apiurl = "https://api.groovebox.org";

  var requests = {
    get: function(url, callback, options) {
      $.get(url, options || {}, function(results) {
      }).done(function(data) {
        if (callback) { callback(data); }
      });
    },

    post: function(url, data, callback) {
      $.post(url, data, function(results) {
      }).done(function(data) {
        if (callback) { callback(data); }
      });
    },

    put: function(url, data, callback) {
      $.put(url, data, function(results) {
      }).done(function(data) {
        if (callback) { callback(data); }
      });
    }
  };

  search = function(query, callback) {
    var url = apiurl + '/search?q=' + query;
    requests.get(url, callback);
  }

  Artist = function(id) {
    this.id = id;
  };
  Artist.all = function(callback, options) {
    var url = apiurl + '/artists';
    requests.get(url, callback);
  };

  Artist.prototype = {
    get: function(callback) {
      var url = apiurl + '/artists/' + this.id;
      requests.get(url, callback);
    },

    albums: function(callback) {
      var url = apiurl + '/artists/' + this.id + '/albums';
      requests.get(url, callback);
    },

    concerts: function(callback) {
      var url = apiurl + '/artists/' + this.id + '/concerts';
      requests.get(url, callback);
    },

    songs: function(callback) {
      var url = apiurl + '/artists/' + this.id + '/songs';
      requests.get(url, callback);
    }
  };


  Album = function(id) {
    this.id = id;
  };
  Album.prototype = {
    get: function(callback) {
      var url = apiurl + '/albums/' + this.id;
      requests.get(url, callback);
    }
  };

  Concert = function(tag) {
    this.id = tag;
  };
  Concert.prototype = {
    get: function(callback) {
      var url = apiurl + '/concerts/' + this.id;
      requests.get(url, callback);
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
      requests.get(url, callback);
    }
  };

  Genre = function(id) {
    this.id = id;
  };
  Genre.prototype = {
    get: function(callback) {
      var url = apiurl + '/genre/' + this.id;
      requests.get(url, callback);
    },

    songs: function(callback) {
      var url = apiurl + '/genre/' + this.id + '/songs';
      requests.get(url, callback);
    }
  };

  Song = function(id) {
    this.id = id;
  };
  Song.prototype = {
    get: function(callback) {
      var url = apiurl + '/songs/' + this.id;
      requests.get(url, callback);
    },

    tracks: function(callback) {
      var url = apiurl + '/songs/' + this.id + '/tracks';
      requests.get(url, callback);
    }
  };
}());
