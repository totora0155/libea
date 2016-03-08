'use strict';
const fs = require('fs');
const glob = require('glob');
const marked = require('marked');
const libea = require('../..');

const renderer = new libea.Renderer();
renderer.contentWillProcess((content) => {
  return marked(content);
});

glob('./src/templates/**/*.html', (err, list) => {
  fs.readFile(list[0], 'utf-8', (err, template) => {
    libea({base: template}, renderer)
      .process(`
foooooooooooo
        `);
  });
});
// libea();

// import glob from 'glob';
// import libea from '../..';
//
// // fs
// import config from './libea.config.babel';
//
// const src = './posts/*.md'
// const dist = '../dist/'
//
// // or
// // const mylibea = new libea.Renderer()
//
// class Renderer extends libea.Renderer {
//   constructor() {
//     super();
//   }
//
//   /**
//    * aaaa
//    * @method contentDidRead
//    * @param {Object}
//    */
//   contentWillRead({opts, content}) {
//   }
//
//   contentDidRead(/*{}*/) {
//   }
// }
//
// libea(src).pipe(dist);
// libea(src, Renderer).pipe(dist);
