#!/usr/bin/env python
# -*-coding: utf-8 -*-

"""
    app.py
    ~~~~~~

    :copyright: (c) 2015 by Mek
    :license: see LICENSE for more details.
"""

from flask import Flask
from flask.ext.routing import router
import views
from configs import options

urls = ('/favicon.ico', views.Favicon,
        '/partials/<path:uri>', views.Partial,
        '/<path:uri>', views.Base,
        '/', views.Base
        )
app = router(Flask(__name__), urls)

if __name__ == "__main__":
    app.run(**options)
