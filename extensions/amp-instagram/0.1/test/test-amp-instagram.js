/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
require('../amp-instagram');
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-instagram', () => {

  function getIns(shortcode, opt_responsive, opt_beforeLayoutCallback) {
    return createIframePromise(true, opt_beforeLayoutCallback).then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const ins = iframe.doc.createElement('amp-instagram');
      ins.setAttribute('data-shortcode', shortcode);
      ins.setAttribute('width', '111');
      ins.setAttribute('height', '222');
      ins.setAttribute('alt', 'Testing');
      if (opt_responsive) {
        ins.setAttribute('layout', 'responsive');
      }
      return iframe.addElement(ins);
    });
  }

  function testImage(image) {
    expect(image).to.not.be.null;
    expect(image.getAttribute('src')).to.equal(
        'https://www.instagram.com/p/fBwFP/media/?size=l');
    expect(image.getAttribute('layout')).to.equal('fill');
    expect(image.getAttribute('alt')).to.equal('Testing');
  }

  function testIframe(iframe) {
    expect(iframe).to.not.be.null;
    expect(iframe.src).to.equal('https://www.instagram.com/p/fBwFP/embed/?v=4');
    expect(iframe.getAttribute('width')).to.equal('111');
    expect(iframe.getAttribute('height')).to.equal('222');
    expect(iframe.getAttribute('title')).to.equal('Instagram: Testing');
  }

  it('renders', () => {
    return getIns('fBwFP').then(ins => {
      testIframe(ins.querySelector('iframe'));
      testImage(ins.querySelector('amp-img'));
    });
  });

  it('builds a placeholder image without inserting iframe', () => {
    return getIns('fBwFP', true, ins => {
      console.log(ins);
      const placeholder = ins.querySelector('[placeholder]');
      const iframe = ins.querySelector('iframe');
      expect(iframe).to.be.null;
      expect(placeholder.style.display).to.be.equal('');
      testImage(placeholder.querySelector('amp-img'));
    }).then(ins => {
      const placeholder = ins.querySelector('[placeholder]');
      const iframe = ins.querySelector('iframe');
      ins.getVsync = () => {
        return {
          mutate: fn => fn(),
        };
      };
      testIframe(iframe);
      testImage(placeholder.querySelector('amp-img'));
      ins.implementation_.iframePromise_.then(() => {
        expect(placeholder.style.display).to.be.equal('none');
      });
    });
  });

  it('removes iframe after unlayoutCallback', () => {
    return getIns('fBwFP').then(ins => {
      const placeholder = ins.querySelector('[placeholder]');
      testIframe(ins.querySelector('iframe'));
      const obj = ins.implementation_;
      obj.unlayoutCallback();
      expect(ins.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.iframePromise_).to.be.null;
      expect(placeholder.style.display).to.be.equal('');
    });
  });

  it('renders responsively', () => {
    return getIns('fBwFP', true).then(ins => {
      expect(ins.className).to.match(/amp-layout-responsive/);
    });
  });

  it('requires data-shortcode', () => {
    expect(getIns('')).to.be.rejectedWith(
        /The data-shortcode attribute is required for/);
  });
});
