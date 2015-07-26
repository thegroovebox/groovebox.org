#!/usr/bin/env python
# -*-coding: utf-8 -*-

"""
    __init__.py
    ~~~~~~~~~~~

    :copyright: (c) 2015 by Mek Karpeles
    :license: see LICENSE for more details.
"""

from werkzeug import wrappers
from flask import render_template, Response
from flask.views import MethodView


class Favicon(MethodView):
    def get(self):
        return ""


class Base(MethodView):
    def get(self, uri=None):
        template = "partials/%s.html" % (uri or "index")
        return render_template('base.html', template=template)


class Partial(MethodView):
    def get(self, partial):
        return render_template('partials/%s.html' % partial)
