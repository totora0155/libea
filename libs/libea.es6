import fsp from 'fs-promise';
import glob from 'glob';
import matter from 'gray-matter';
// import component from './component';
import EventEmitter from 'events';

import store from './store';

let libeaConfig;


import React from 'react';
import ReactDOMServer from 'react-dom/server';
import HTMLtoJSX from 'htmltojsx';
import babel from 'babel-core';
import {createComponent} from './component';
import Processor from './processor';

const _templates = {};

function libea(templates, renderer) {
  return new Processor(templates, renderer || new libea.Renderer());
}

libea.Renderer = class Renderer extends EventEmitter {
  constructor() {
    super();
  }

  contentWillProcess(handle) {
    this.contentWillProcess = handle;
  }
}

export default libea;
