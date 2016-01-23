'use strict';

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const _ = require('lodash');
const matter = require('gray-matter');
const divide = require('html-divide');
const colors = require('colors');

class Libea extends EventEmitter {
  constructor (opts) {
    super();
    const defaults = {
      cwd: './',
      compiler: {},
      query: {
        inserter: 'libea[insert]',
        wrapper: 'libea[wrap]',
      },
    };
    _.merge(defaults, opts);
    this.opts = defaults;
  }

  render(orig, cb) {
    const Renderer = require('./lib/renderer');
    const renderer = new Renderer(orig, this.opts);

    renderer.exec().then((html) => {
      cb({ html });
    });
  }
}

module.exports = Libea;
