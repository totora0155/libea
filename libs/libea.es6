import fsp from 'fs-promise';
import glob from 'glob';
import matter from 'gray-matter';
import component from './component';
import EventEmitter from 'events';

// state == parentstate == childstate == childchild...

const ev = new EventEmitter();

const cache = new WeakMap();

class Renderer {
  setState() {}
  contnetWillRead() {}
  contentDidRead() {}
}

function libea(src, /* renderer = new Renderer() */) {
  glob(src, {}, (err, files) => {
    if (err) {
      throw new Error(err);
    }

    if (!files.length) {
      throw new Error('not exists');
    }

    ps = src.map(s => fsp.readFile(src, 'utf-8'))

    Promise.all(ps)
      .then((contents) => {
        /* ... */
        data = matter(content);
        this.setState({
          opts: bbb,
          content: aaa,
        });
        ev.emit(CONTENT_DID_READ);


      });
  });

  return {
    Renderer,
  };
}

export default libea;
