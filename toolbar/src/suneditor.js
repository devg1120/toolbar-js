/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import core from './lib/core';
import min from './lib/min';
import util from './lib/util';
import _Constructor from './lib/constructor';
import _Context from './lib/context';
import _Context2 from './lib/context2';

export default {
    init: function (init_options) {
        return {
            create: function (idOrElement, options) {
                return this.create(idOrElement, options, init_options);
            }.bind(this)
        };
    },

    //create: function (idOrElement, options, _init_options) {
    create: function (idOrElement, options ) {
        util._propertiesInit();
        const element = typeof idOrElement === 'string' ? document.getElementById(idOrElement) : idOrElement;


        const cons = _Constructor.init(element, options);
        //let context = _Context(element, cons.constructed, cons.options);
        //return core(context, cons.pluginCallButtons, cons.plugins, cons.options.lang, options, cons._responsiveButtons);
        let context2 = _Context2(element, cons.constructed, cons.options);
        return min(context2, cons.pluginCallButtons, cons.plugins, cons.options.lang, options, cons._responsiveButtons);
    }
};
