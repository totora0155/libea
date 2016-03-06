import glob from 'glob';
import libea from '../..';

// fs
import config from './libea.config.babel';

const src = './posts/*.md'
const dist = '../dist/'

// or
// const mylibea = new libea.Renderer()

class Renderer extends libea.Renderer {
  constructor() {
    super();
  }

  /**
   * aaaa
   * @method contentDidRead
   * @param {Object}
   */
  contentWillRead({opts, content}) {
  }

  contentDidRead(/*{}*/) {
  }
}

libea(src).pipe(dist);
libea(src, Renderer).pipe(dist);
