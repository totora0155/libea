'use strict';
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const EventEmitter = require('events')
const _ = require('lodash');
const co = require('co');
const cheerio = require('cheerio');
const ENC = 'utf-8'

// getStats (filepath) {
//   return new Promise((resolve, reject) => {
//     fs.stat(filepath, (err, stats) => {
//       if (err) return reject(err);
//       return resolve(stats);
//     });
//   });
// }

function getFilePaths(pattern, opts) {
  opts = opts || {};
  return new Promise((resolve, reject) => {
    glob(pattern, opts, (err, files) => {
      if (err) return reject(err);
      return resolve(files);
    });
  });
}

function getAbsPath(somePath) {
  return path.resolve.apply(null, somePath);
}

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, ENC, (err, content) => {
      if (err) return reject(err);
      return resolve(content);
    });
  });
}

class Renderer extends EventEmitter {
  constructor(content, opts) {
    super();
    this.$ = cheerio.load(content);
    this.opts = opts;
  }

  get html() {
    return this.$.html();
  }

  exec() {
    return new Promise(resolve => {
      if (this.hasWrapper()) {
        this.wrap().on('end:wrap', () => {
          this.exec();
        });
      } else if (this.hasInserter()) {
        this.insert().on('end:insert', () => {
          console.log(this.html);
          this.exec();
        });
      } else {
        return resolve(this.html);
      }
    })
  }


  hasWrapper() {
    return this.$(this.opts.query.wrapper).length > 0
  }

  wrap() {
    const _this = this;
    const query = this.opts.query.wrapper;
    this.$(query).map((idx, el) => {
      const pattern = this.$(el).attr('wrap');
      return co(function* () {
        const matches = yield getFilePaths(pattern, _this.opts);
        if (matches.length === 0) throw(`${pattern} is not founded`);
        const content = yield readFile(getAbsPath([
          _this.opts.cwd,
          matches[0],
        ]));
        return content;
      })
        .then((content) => {
          const innerHtml = _this.$(query).html();
          _this.$ = cheerio.load(content);
          const $target = _this.$('libea[box=content]');
          _this.$(innerHtml).insertAfter($target);
          $target.remove();
          _this.hasWrapper() ? _this.wrap() : _this.emit('end:wrap');
        })
        .catch(err => {
          console.error(err.red)
        });
    });
    return this;
  }

  hasInserter() {
    return this.$(this.opts.query.inserter).length > 0
  }

  insert() {
    const _this = this;
    const query = this.opts.query.inserter;
    this.$(query).map((idx, el) => {
      const pattern = this.$(el).attr('insert');
      return co(function* () {
        const matches = yield getFilePaths(pattern, _this.opts);
        if (matches.length === 0) throw(`${pattern} is not founded`);
        const contents = yield _.map(matches, matche => {
          return readFile(getAbsPath([_this.opts.cwd, matche]));
        });
        return contents;
      })
        .then((contents) => {
          const _this = this;
          const promises = _.map(contents, (content) => {
            const childRenderer = new Renderer(content, _this.opts);
            return childRenderer.exec();
          });
          Promise.all(promises).then((htmls) => {
            const content = htmls.join('\n');
            _this.$(query)
              .after(content)
              .remove();
            _this.hasInserter() ? _this.insert() : _this.emit('end:insert');
          });
        })
        .catch(err => {
          console.error(err.red)
        });
    });
    return this;
  }
}

module.exports = Renderer;
