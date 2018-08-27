'use strict';

require('babel-core/register');
global.expect = require('chai').expect;
global.path = require('path');
global.sinon = require('sinon');
require('dotenv').config({path: path.resolve(process.cwd(), 'test/.env')});