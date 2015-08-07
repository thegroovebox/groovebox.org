groovebox
=========

.. image:: https://travis-ci.org/thegroovebox/groovebox.org.svg
    :target: https://travis-ci.org/thegroovebox/groovebox.org

A spotify-like media player for the Internet Archive's collection of live music.

Background
----------

Archive.org has an entire free Live Music collection consisting of
~150,000 live concerts, 2.5M tracks, and ~6,500+ artists. Currently,
there's no easy way to search individual tracks or play tracks from
different albums. Enter groovebox. Groovebox is a spotify clone for
the Internet Archive's music collection.

groovebox.org
-------------

Groovebox.org is the front-end client of the Groovebox application. No
database is required, all calls for data are made over REST to the
api.groovebox.org server.

Installation
------------

The following instructions assume Ubuntu or Debian hosts:

.. code:: bash

    $ aptitude install postgresql-9.4
    $ git clone https://github.com/mekarpeles/api.groovebox.org.git
    $ cd api.groovebox.org
    $ pip3 install -e .
    $ cd groovebox/static
    $ gem install neat sass bourbon
    $ npm install .
    $ npm styles # rebuild sass -> css
    $ python3.4 app.py # run the app

