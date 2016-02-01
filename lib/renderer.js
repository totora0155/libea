'use strict';
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const EventEmitter = require('events')
const _ = require('lodash');
const co = require('co');
const cheerio = require('cheerio');
const matter = require('gray-matter');
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
  const _this = this;
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, ENC, (err, content) => {
      if (err) return reject(err);
      const compiler = _this.opts.compiler[path.extname(filePath)];
      return resolve(content);
    });
  });
}

class Renderer extends EventEmitter {
  constructor(content, opts) {
    super();
    this.$ = cheerio.load(content, {decodeEntities: false});
    this.matter = matter(content);
    this.opts = opts;
  }

  get html() {
    return this.$.html();
  }

  exec() {
    return new Promise((resolve) => {
      if (this.hasInserter()) {
        this.insert().on('end:insert', () => {
          return resolve(this.exec());
        });
      } else if (this.hasWrapper()) {
        this.wrap().on('end:wrap', () => {
          return resolve(this.exec());
        });
      } else {
        const $ = cheerio.load(this.html, {decodeEntities: false});
        _.forEach(this.matter.data, (val, key) => {
          $(`[libea-bind=${key}]`).text(val).removeAttr('libea-bind');
        });
        return resolve($.html());
      }
    });
  }

  hasWrapper() {
    return this.$(this.opts.query.wrapper).length > 0
  }

  wrap() {
    const _this = this;
    const query = this.opts.query.wrapper;
    this.$(query).each((idx, el) => {
      const pattern = this.$(el).attr('wrap');
      co(function* () {
        const matches = yield getFilePaths(pattern, _this.opts);
        if (matches.length === 0) throw `${pattern} is not founded`;
        const content = yield readFile.call(_this, getAbsPath([
          _this.opts.cwd,
          matches[0],
        ]));
        const _matter = matter(content);
        _.defaults(_this.matter.data, _matter.data);
        return _matter.content;
      })
        .then((content) => {
          const innerHtml = _this.$(query).html();
          _this.$ = cheerio.load(content, {decodeEntities: false});
          _this.$('libea[box=content]').after(_this.$(innerHtml)).remove();
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
    const $el = this.$(query);
    const template = $el.html();
    $el.each((idx, el) => {
      const pattern = this.$(el).attr('insert');
      co(function* () {
        const matches = yield getFilePaths(pattern, _this.opts);
        if (matches.length === 0) throw `${pattern} is not founded`;
        const contents = yield _.map(matches, matche => {
          return readFile.call(_this, getAbsPath([_this.opts.cwd, matche]));
        });
        return contents;
      })
        .then((contents) => {
          const _this = this;
          const promises = _.map(contents, (content) => {
            return new Renderer(content, _this.opts).exec();
          });
          Promise.all(promises).then((htmls) => {
            const content = _.chain(htmls)
              .map((html) => {
                const $ = cheerio.load(template, {decodeEntities: false});
                $('libea[box=content]').after(html).remove();
                return $.html();
              })
              .reduce((result, content) => result += content)
              .value();
            _this.$(query).eq(idx).after(content).remove();
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
