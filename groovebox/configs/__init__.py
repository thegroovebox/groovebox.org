#!/usr/bin/env python
# -*-coding: utf-8 -*-

"""
    __init__.py
    ~~~~~~~~~~~
    Configurations for groovebox-client

    :copyright: (c) 2015 by Mek Karpeles
    :license: see LICENSE for more details.
"""

import os
import types
import configparser

__title__ = 'groovebox-client'
__version__ = '0.0.1'
__author__ = [
    'Mek <michael.karpeles@gmail.com>'
    ]

path = os.path.dirname(os.path.realpath(__file__))
approot = os.path.abspath(os.path.join(path, os.pardir))


def getdef(self, section, option, default_value):
    try:
        return self.get(section, option)
    except:
        return default_value


config = configparser.ConfigParser()
config.read('%s/settings.cfg' % path)
config.getdef = types.MethodType(getdef, config)

HOST = config.getdef("server", "host", '0.0.0.0')
PORT = int(config.getdef("server", "port", 8080))
DEBUG = bool(int(config.getdef("server", "debug", 1)))
CRT = config.getdef("ssl", "crt", '')
KEY = config.getdef("ssl", "key", '')
options = {'debug': DEBUG, 'host': HOST, 'port': PORT}
if CRT and KEY:
    options['ssl_context'] = (CRT, KEY)
