
(function () {
  'use strict';

  if ($('section#artists').length) {
    Artist.all(function(artists) {
      for (var a in artists){
	var artist = artists[a];
	$('section#artists').append(
	  '<card><div class="album-cover"><button class="fakebutton" '
	    + 'artist="' + artist.tag + '"><img src="' + artist.avatar + '"/>'
	    + '</button></div><div class="album-details"><h2>' + artist.name 
	    + '</h2></div></card>'
	);
      }
    });
  }
}());