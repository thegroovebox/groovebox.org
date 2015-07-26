#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
    tests.test_groovebox
    ~~~~~~~~~~~~~~~~~~~~

    This module tests groovebox-client

    :copyright: (c) 2015 by Mek.
    :license: see LICENSE for more details.
"""

import unittest
import app as groovebox


class TestGroovebox(unittest.TestCase):

    def setUp(self):
        self.app = groovebox.app.test_client()

    def tearDown(self):
        pass


if __name__ == '__main__':
    unittest.main()
