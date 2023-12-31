'use strict';

import _Constructor from './constructor';
import _util from './util';

export default function (context, pluginCallButtons, plugins, lang, options, _responsiveButtons) {
    const _d = context.element.originElement.ownerDocument || document;
    const _w = _d.defaultView || window;
    const util = _util;
    const icons = options.icons;

    const core = {
        _d: _d,
        _w: _w,
        _parser: new _w.DOMParser(),
        _prevRtl: options.rtl,
        _editorHeight: 0,
        _editorHeightPadding: 0,
        _listCamel: options.__listCommonStyle,
        _listKebab: util.camelToKebabCase(options.__listCommonStyle),
        _wd: null,
        _ww: null,
        _shadowRoot: null,
        _shadowRootControllerEventTarget: null,
        util: util,
        functions: null,
        options: null,
        wwComputedStyle: null,
        icons: icons,
        history: null,
        context: context,
        pluginCallButtons: pluginCallButtons,
        plugins: plugins || {},
        initPlugins: {},
        _targetPlugins: {},
        _menuTray: {},
        lang: lang,
        effectNode: null,
        submenu: null,
        container: null,
        _submenuName: '',
        _bindedSubmenuOff: null,
        _bindedContainerOff: null,
        submenuActiveButton: null,
        codeViewDisabledButtons: [],
        resizingDisabledButtons: [],
        isDisabled: false,
        isReadOnly: false,
        activePlugins: null,

        _variable: {
            isChanged: false,
            isCodeView: false,
            isFullScreen: false,
            innerHeight_fullScreen: 0,
            resizeClientY: 0,
            tabSize: 4,
            codeIndent: 2,
            minResizingSize: util.getNumber((context.element.wysiwygFrame.style.minHeight || '65'), 0),
            currentNodes: [],
            currentNodesMap: [],
            _range: null,
            _selectionNode: null,
            _originCssText: context.element.topArea.style.cssText,
            _bodyOverflow: '',
            _editorAreaOriginCssText: '',
            _wysiwygOriginCssText: '',
            _codeOriginCssText: '',
            _fullScreenAttrs: {sticky: false, balloon: false, inline: false},
            _lineBreakComp: null,
            _lineBreakDir: ''
        },

        getContents: function (onlyContents) {
                return '<!DOCTYPE html><html>' +  '<body '  + '>'  + '</body></html>';
        },



        _deleteDisallowedTags: function (html) {                              
                        html = html                                                                                                             .replace(this.__disallowedTagsRegExp, '')             
                                .replace(/<[a-z0-9]+\:[a-z0-9]+[^>^\/]*>[^>]*<\/[a-z0-9]+\:[a-z0-9]+>/gi, '');
                                  
            if (!/\bfont\b/i.test(this.options._editorTagsWhitelist)) {
                html = html.replace(/(<\/?)font(\s?)/gi, '$1span$2');                       
            }                                   
                                                    
                        return html.replace(this.editorTagsWhitelistRegExp, '').replace(this.editorTagsBlacklistRegExp, '');                                                     
                },   

        callPlugin: function (pluginName, callBackFunction, _target) {
		console.log("callPlugin");

        },

        initMenuTarget: function (pluginName, target, menu) {
            if (!target) {
                this._targetPlugins[pluginName] = menu;
            } else {
                context.element._menuTray.appendChild(menu);
                this._targetPlugins[pluginName] = true;
                this._menuTray[target.getAttribute('data-command')] = menu;
            }
        },

        submenuOn: function (element) {
            if (this._bindedSubmenuOff) this._bindedSubmenuOff();
            if (this._bindControllersOff) this.controllersOff();

            const submenuName = this._submenuName = element.getAttribute('data-command');
            const menu = this.submenu = this._menuTray[submenuName];
            this.submenuActiveButton = element;
            this._setMenuPosition(element, menu);
            
            this._bindedSubmenuOff = this.submenuOff.bind(this);
            this.addDocEvent('mousedown', this._bindedSubmenuOff, false);

            if (this.plugins[submenuName].on) this.plugins[submenuName].on.call(this);
            this._antiBlur = true;
        },

        submenuOff: function () {
            //this.removeDocEvent('mousedown', this._bindedSubmenuOff);
            this._bindedSubmenuOff = null;

            if (this.submenu) {
                this._submenuName = '';
                this.submenu.style.display = 'none';
                this.submenu = null;
                util.removeClass(this.submenuActiveButton, 'on');
                this.submenuActiveButton = null;
                this._notHideToolbar = false;
            }

            this._antiBlur = false;
        },

        _setMenuPosition: function (element, menu) {
            menu.style.visibility = 'hidden';
            menu.style.display = 'block';
            menu.style.height = '';
            util.addClass(element, 'on');

            const toolbar = this.context.element.toolbar;
            const toolbarW = toolbar.offsetWidth;
            const toolbarOffset = event._getEditorOffsets(context.element.toolbar);
            const menuW = menu.offsetWidth;
            const l = element.parentElement.offsetLeft + 3;

            // rtl
            if (options.rtl) {
                const elementW = element.offsetWidth;
                const rtlW = menuW > elementW ? menuW - elementW : 0;
                const rtlL = rtlW > 0 ? 0 : elementW - menuW;
                menu.style.left = (l - rtlW + rtlL) + 'px';
                if (toolbarOffset.left > event._getEditorOffsets(menu).left) {
                    menu.style.left = '0px';
                }
            } else {
                const overLeft = toolbarW <= menuW ? 0 : toolbarW - (l + menuW);
                if (overLeft < 0) menu.style.left = (l + overLeft) + 'px';
                else menu.style.left = l + 'px';
            }

            // get element top
            let t = 0;
            let offsetEl = element;
            while (offsetEl && offsetEl !== toolbar) {
                t += offsetEl.offsetTop;
                offsetEl = offsetEl.offsetParent;
            }

            const bt = t;
            if (this._isBalloon) {
                t += toolbar.offsetTop + element.offsetHeight;
            } else {
                t -= element.offsetHeight;
            }

            // set menu position
            const toolbarTop = toolbarOffset.top;
            const menuHeight = menu.offsetHeight;
            const scrollTop = this.getGlobalScrollOffset().top;

            const menuHeight_bottom = _w.innerHeight - (toolbarTop - scrollTop + bt + element.parentElement.offsetHeight);
            if (menuHeight_bottom < menuHeight) {
                let menuTop = -1 * (menuHeight - bt + 3);
                const insTop = toolbarTop - scrollTop + menuTop;
                const menuHeight_top = menuHeight + (insTop < 0 ? insTop : 0);
                
                if (menuHeight_top > menuHeight_bottom) {
                    menu.style.height = menuHeight_top + 'px';
                    menuTop = -1 * (menuHeight_top - bt + 3);
                } else {
                    menu.style.height = menuHeight_bottom + 'px';
                    menuTop = bt + element.parentElement.offsetHeight;
                }

                menu.style.top = menuTop + 'px';
            } else {
                menu.style.top = (bt + element.parentElement.offsetHeight) + 'px';
            }

            menu.style.visibility = '';
        },

        actionCall: function (command, display, target) {
            // call plugins
            if (display) {
                if (/more/i.test(display)) {
                    if (target !== this._moreLayerActiveButton) {
                        const layer = context.element.toolbar.querySelector('.' + command);
                        if (layer) {
                            if (this._moreLayerActiveButton) this.moreLayerOff();

                            this._moreLayerActiveButton = target;
                            layer.style.display = 'block';

                            event._showToolbarBalloon();
                            event._showToolbarInline();
                        }
                        util.addClass(target, 'on');
                    } else {
                        const layer = context.element.toolbar.querySelector('.' + this._moreLayerActiveButton.getAttribute('data-command'));
                        if (layer) {
                            this.moreLayerOff();

                            event._showToolbarBalloon();
                            event._showToolbarInline();
                        }        
                    }
                    return;
                }
                
                if (/container/.test(display) && (this._menuTray[command] === null || target !== this.containerActiveButton)) {
                    this.callPlugin(command, this.containerOn.bind(this, target), target);
                    return;
                } 
                
                if (this.isReadOnly && util.arrayIncludes(this.resizingDisabledButtons, target)) return;
                if (/submenu/.test(display) && (this._menuTray[command] === null || target !== this.submenuActiveButton)) {
                    this.callPlugin(command, this.submenuOn.bind(this, target), target);
                    return;
                } else if (/dialog/.test(display)) {
                    this.callPlugin(command, this.plugins[command].open.bind(this), target);
                    return;
                } else if (/command/.test(display)) {
                    this.callPlugin(command, this.plugins[command].action.bind(this), target);
                } else if (/fileBrowser/.test(display)) {
                    this.callPlugin(command, this.plugins[command].open.bind(this, null), target);
                }
            } // default command
            else if (command) {
                this.commandHandler(target, command);
            }

            if (/submenu/.test(display)) {
                this.submenuOff();
            } else if (!/command/.test(display)) {
                this.submenuOff();
                //this.containerOff();
            }
        },

        commandHandler: function (target, command) {
            if (core.isReadOnly && !/copy|cut|selectAll|codeView|fullScreen|print|preview|showBlocks/.test(command)) return;
            switch (command) {
                case 'copy':
                case 'cut':
                    break;
                case 'paste':
                    break;
                case 'selectAll':
                    break;
                case 'codeView':
                    break;
                case 'fullScreen':
                    break;
                case 'indent':
                case 'outdent':
                    break;
                case 'undo':
			    console.log("undo");
                    break;
                case 'redo':
			    console.log("redo");
                    break;
                case 'removeFormat':
                    break;
                case 'print':
                    break;
                case 'preview':
                    break;
                case 'showBlocks':
                    break;
                case 'dir':
                    break;
                case 'dir_ltr':
                    break;
                case 'dir_rtl':
                    break;
                case 'save':
                    break;
                default : // 'STRONG', 'U', 'EM', 'DEL', 'SUB', 'SUP'..
            }
        },



        resetResponsiveToolbar: function () {
            core.controllersOff();

            const responsiveSize = event._responsiveButtonSize;
            if (responsiveSize) {
                let w = 0;
                if ((core._isBalloon || core._isInline) && options.toolbarWidth === 'auto') {
                    w = context.element.topArea.offsetWidth;
                } else {
                    w = context.element.toolbar.offsetWidth;
                }

                let responsiveWidth = 'default';
                for (let i = 1, len = responsiveSize.length; i < len; i++) {
                    if (w < responsiveSize[i]) {
                        responsiveWidth = responsiveSize[i] + '';
                        break;
                    }
                }

                if (event._responsiveCurrentSize !== responsiveWidth) {
                    event._responsiveCurrentSize = responsiveWidth;
                    functions.setToolbarButtons(event._responsiveButtons[responsiveWidth]);
                }
            }
        },

/*
        _init: function (reload, _initHTML) {

        },
	*/
/*
        _setOptionsInit: function (el, _initHTML) {
            this.context = context = _Context(el.originElement, this._getConstructed(el), options);
            this._componentsInfoReset = true;
            this._editorInit(true, _initHTML);
        },
*/
        _editorInit: function (reload, _initHTML) {
            event._addEvent();

            // toolbar visibility
            context.element.toolbar.style.visibility = '';
        },

        _getConstructed: function (contextEl) {
            return {
                _top: contextEl.topArea,
                _relative: contextEl.relative,
                _toolBar: contextEl.toolbar,
                _toolbarShadow: contextEl._toolbarShadow,
                _menuTray: contextEl._menuTray,
                _editorArea: contextEl.editorArea,
                _wysiwygArea: contextEl.wysiwygFrame,
                _codeArea: contextEl.code,
                _placeholder: contextEl.placeholder,
                _resizingBar: contextEl.resizingBar,
                _navigation: contextEl.navigation,
                _charCounter: contextEl.charCounter,
                _charWrapper: contextEl.charWrapper,
                _loading: contextEl.loading,
                _lineBreaker: contextEl.lineBreaker,
                _lineBreaker_t: contextEl.lineBreaker_t,
                _lineBreaker_b: contextEl.lineBreaker_b,
                _resizeBack: contextEl.resizeBackground,
                _stickyDummy: contextEl._stickyDummy,
                _arrow: contextEl._arrow
            };
        }
    };


    const event = {
        _IEisComposing: false, // In IE, there is no "e.isComposing" in the key-up event.
        _lineBreakerBind: null,
        _responsiveCurrentSize: 'default',
        _responsiveButtonSize: null,
        _responsiveButtons: null,
        _cursorMoveKeyCode: new _w.RegExp('^(8|3[2-9]|40|46)$'),
        _directionKeyCode: new _w.RegExp('^(8|13|3[2-9]|40|46)$'),
        _nonTextKeyCode: new _w.RegExp('^(8|13|1[6-9]|20|27|3[3-9]|40|45|46|11[2-9]|12[0-3]|144|145)$'),
        _historyIgnoreKeyCode: new _w.RegExp('^(1[6-9]|20|27|3[3-9]|40|45|11[2-9]|12[0-3]|144|145)$'),
        _onButtonsCheck: new _w.RegExp('^(' + _w.Object.keys(options._textTagsMap).join('|') + ')$', 'i'),
        _frontZeroWidthReg: new _w.RegExp(util.zeroWidthSpace + '+', ''),
        _keyCodeShortcut: {
            65: 'A',
            66: 'B',
            83: 'S',
            85: 'U',
            73: 'I',
            89: 'Y',
            90: 'Z',
            219: '[',
            221: ']'
        },



        _buttonsEventHandler: function (e) {
            let target = e.target;
            if (core._bindControllersOff) e.stopPropagation();

            if (/^(input|textarea|select|option)$/i.test(target.nodeName)) {
                core._antiBlur = false;
            } else {
                e.preventDefault();
            }

            if (util.getParentElement(target, '.se-submenu')) {
                e.stopPropagation();
                core._notHideToolbar = true;
            } else {
                let command = target.getAttribute('data-command');
                let className = target.className;
    
                while (!command && !/se-menu-list/.test(className) && !/sun-editor-common/.test(className)) {
                    target = target.parentNode;
                    command = target.getAttribute('data-command');
                    className = target.className;
                }
    
                if (command === core._submenuName || command === core._containerName) {
                    e.stopPropagation();
                }
            }
        },

        onClick_toolbar: function (e) {
            let target = e.target;
            let display = target.getAttribute('data-display');
            let command = target.getAttribute('data-command');
            let className = target.className;
            //core.controllersOff();

            while (target.parentNode && !command && !/se-menu-list/.test(className) && !/se-toolbar/.test(className)) {
                target = target.parentNode;
                command = target.getAttribute('data-command');
                display = target.getAttribute('data-display');
                className = target.className;
            }

            if (!command && !display) return;
            if (target.disabled) return;

            core.actionCall(command, display, target);
        },


        _balloonDelay: null,
        _showToolbarBalloonDelay: function () {
            if (event._balloonDelay) {
                _w.clearTimeout(event._balloonDelay);
            }

            event._balloonDelay = _w.setTimeout(function () {
                _w.clearTimeout(this._balloonDelay);
                this._balloonDelay = null;
                this._showToolbarBalloon();
            }.bind(event), 350);
        },

        _toggleToolbarBalloon: function () {
            core._editorRange();
            const range = core.getRange();
            if (core._bindControllersOff || (!core._isBalloonAlways && range.collapsed)) event._hideToolbar();
            else event._showToolbarBalloon(range);
        },

        _showToolbarBalloon: function (rangeObj) {
            if (!core._isBalloon) return;

            const range = rangeObj || core.getRange();
            const toolbar = context.element.toolbar;
            const topArea = context.element.topArea;
            const selection = core.getSelection();

            let isDirTop;
            if (core._isBalloonAlways && range.collapsed) {
                isDirTop = true;
            } else if (selection.focusNode === selection.anchorNode) {
                isDirTop = selection.focusOffset < selection.anchorOffset;
            } else {
                const childNodes = util.getListChildNodes(range.commonAncestorContainer, null);
                isDirTop = util.getArrayIndex(childNodes, selection.focusNode) < util.getArrayIndex(childNodes, selection.anchorNode);
            }

            let rects = range.getClientRects();
            rects = rects[isDirTop ? 0 : rects.length - 1];

            const globalScroll = core.getGlobalScrollOffset();
            let scrollLeft = globalScroll.left;
            let scrollTop = globalScroll.top;

            const editorWidth = topArea.offsetWidth;
            const offsets = event._getEditorOffsets(null);
            const stickyTop = offsets.top;
            const editorLeft = offsets.left;
            
            toolbar.style.top = '-10000px';
            toolbar.style.visibility = 'hidden';
            toolbar.style.display = 'block';

            if (!rects) {
                const node = core.getSelectionNode();
                if (util.isFormatElement(node)) {
                    const zeroWidth = util.createTextNode(util.zeroWidthSpace);
                    core.insertNode(zeroWidth, null, false);
                    core.setRange(zeroWidth, 1, zeroWidth, 1);
                    core._editorRange();
                    rects = core.getRange().getClientRects();
                    rects = rects[isDirTop ? 0 : rects.length - 1];
                }

                if (!rects) {
                    const nodeOffset = util.getOffset(node, context.element.wysiwygFrame);
                    rects = {
                        left: nodeOffset.left,
                        top: nodeOffset.top,
                        right: nodeOffset.left,
                        bottom: nodeOffset.top + node.offsetHeight,
                        noText: true
                    };
                    scrollLeft = 0;
                    scrollTop = 0;
                }

                isDirTop = true;
            }

            const arrowMargin = _w.Math.round(context.element._arrow.offsetWidth / 2);
            const toolbarWidth = toolbar.offsetWidth;
            const toolbarHeight = toolbar.offsetHeight;
            const iframeRects = /iframe/i.test(context.element.wysiwygFrame.nodeName) ? context.element.wysiwygFrame.getClientRects()[0] : null;
            if (iframeRects) {
                rects = {
                    left: rects.left + iframeRects.left,
                    top: rects.top + iframeRects.top,
                    right: rects.right + iframeRects.right - iframeRects.width,
                    bottom: rects.bottom + iframeRects.bottom - iframeRects.height
                };
            }
            
            event._setToolbarOffset(isDirTop, rects, toolbar, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop, arrowMargin);
            if (toolbarWidth !== toolbar.offsetWidth || toolbarHeight !== toolbar.offsetHeight) {
                event._setToolbarOffset(isDirTop, rects, toolbar, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop, arrowMargin);
            }

            if (options.toolbarContainer) {
                const editorParent = topArea.parentElement;

                let container = options.toolbarContainer;
                let left = container.offsetLeft;
                let top = container.offsetTop;

                while(!container.parentElement.contains(editorParent) || !/^(BODY|HTML)$/i.test(container.parentElement.nodeName)) {
                    container = container.offsetParent;
                    left += container.offsetLeft;
                    top += container.offsetTop;
                }

                toolbar.style.left = (toolbar.offsetLeft - left + topArea.offsetLeft) + 'px';
                toolbar.style.top = (toolbar.offsetTop - top + topArea.offsetTop) + 'px';
            }

            toolbar.style.visibility = '';
        },

        _setToolbarOffset: function (isDirTop, rects, toolbar, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop, arrowMargin) {
            const padding = 1;
            const toolbarWidth = toolbar.offsetWidth;
            const toolbarHeight = rects.noText && !isDirTop ? 0 : toolbar.offsetHeight;

            const absoluteLeft = (isDirTop ? rects.left : rects.right) - editorLeft - (toolbarWidth / 2) + scrollLeft;
            const overRight = absoluteLeft + toolbarWidth - editorWidth;
            
            let t = (isDirTop ? rects.top - toolbarHeight - arrowMargin : rects.bottom + arrowMargin) - (rects.noText ? 0 : stickyTop) + scrollTop;
            let l = absoluteLeft < 0 ? padding : overRight < 0 ? absoluteLeft : absoluteLeft - overRight - padding - 1;

            let resetTop = false;
            const space = t + (isDirTop ? (event._getEditorOffsets(null).top) : (toolbar.offsetHeight - context.element.wysiwyg.offsetHeight));
            if (!isDirTop && space > 0 && event._getPageBottomSpace() < space) {
                isDirTop = true;
                resetTop = true;
            } else if (isDirTop && _d.documentElement.offsetTop > space) {
                isDirTop = false;
                resetTop = true;
            }

            if (resetTop) t = (isDirTop ? rects.top - toolbarHeight - arrowMargin : rects.bottom + arrowMargin) - (rects.noText ? 0 : stickyTop) + scrollTop;

            toolbar.style.left = _w.Math.floor(l) + 'px';
            toolbar.style.top = _w.Math.floor(t) + 'px';

            if (isDirTop) {
                util.removeClass(context.element._arrow, 'se-arrow-up');
                util.addClass(context.element._arrow, 'se-arrow-down');
                context.element._arrow.style.top = toolbarHeight + 'px';
            } else {
                util.removeClass(context.element._arrow, 'se-arrow-down');
                util.addClass(context.element._arrow, 'se-arrow-up');
                context.element._arrow.style.top = -arrowMargin + 'px';
            }

            const arrow_left = _w.Math.floor((toolbarWidth / 2) + (absoluteLeft - l));
            context.element._arrow.style.left = (arrow_left + arrowMargin > toolbar.offsetWidth ? toolbar.offsetWidth - arrowMargin : arrow_left < arrowMargin ? arrowMargin : arrow_left) + 'px';
        },

        _showToolbarInline: function () {
            if (!core._isInline) return;

            const toolbar = context.element.toolbar;
            if (options.toolbarContainer) toolbar.style.position = 'relative';
            else toolbar.style.position = 'absolute';
            
            toolbar.style.visibility = 'hidden';
            toolbar.style.display = 'block';
            core._inlineToolbarAttr.width = toolbar.style.width = options.toolbarWidth;
            core._inlineToolbarAttr.top = toolbar.style.top = (options.toolbarContainer ? 0 : (-1 - toolbar.offsetHeight)) + 'px';
            
            if (typeof functions.showInline === 'function') functions.showInline(toolbar, context, core);

            event.onScroll_window();
            core._inlineToolbarAttr.isShow = true;
            toolbar.style.visibility = '';
        },

        _hideToolbar: function () {
            if (!core._notHideToolbar && !core._variable.isFullScreen) {
                context.element.toolbar.style.display = 'none';
                core._inlineToolbarAttr.isShow = false;
            }
        },



        onMouseDown_resizingBar: function (e) {
            e.stopPropagation();

            core.submenuOff();
            core.controllersOff();

            core._variable.resizeClientY = e.clientY;
            context.element.resizeBackground.style.display = 'block';

            function closureFunc() {
                context.element.resizeBackground.style.display = 'none';
                _d.removeEventListener('mousemove', event._resize_editor);
                _d.removeEventListener('mouseup', closureFunc);
            }

            _d.addEventListener('mousemove', event._resize_editor);
            _d.addEventListener('mouseup', closureFunc);
        },

        _resize_editor: function (e) {
            const resizeInterval = context.element.editorArea.offsetHeight + (e.clientY - core._variable.resizeClientY);
            const h = (resizeInterval < core._variable.minResizingSize ? core._variable.minResizingSize : resizeInterval);
            context.element.wysiwygFrame.style.height = context.element.code.style.height = h + 'px';
            core._variable.resizeClientY = e.clientY;
            if (!util.isResizeObserverSupported) core.__callResizeFunction(h, null);
        },

        onResize_window: function () {

            if (!util.isResizeObserverSupported) core.resetResponsiveToolbar();

            const toolbar = context.element.toolbar;
            const isToolbarHidden = (toolbar.style.display === 'none' || (core._isInline && !core._inlineToolbarAttr.isShow));
            if (toolbar.offsetWidth === 0 && !isToolbarHidden) return;

            if (context.fileBrowser && context.fileBrowser.area.style.display === 'block') {
                context.fileBrowser.body.style.maxHeight = (_w.innerHeight - context.fileBrowser.header.offsetHeight - 50) + 'px';
            }

            if (core.submenuActiveButton && core.submenu) {
                core._setMenuPosition(core.submenuActiveButton, core.submenu);
            }

            if (core._variable.isFullScreen) {
                core._variable.innerHeight_fullScreen += (_w.innerHeight - toolbar.offsetHeight) - core._variable.innerHeight_fullScreen;
                context.element.editorArea.style.height = core._variable.innerHeight_fullScreen + 'px';
                return;
            }

            if (core._variable.isCodeView && core._isInline) {
                event._showToolbarInline();
                return;
            }
            
            //core._iframeAutoHeight();

            if (core._sticky) {
                toolbar.style.width = (context.element.topArea.offsetWidth - 2) + 'px';
                event.onScroll_window();
            }
        },

        _getEditorOffsets: function (container) {
            let offsetEl = container || context.element.topArea;
            let t = 0, l = 0, s = 0;

            while (offsetEl) {
                t += offsetEl.offsetTop;
                l += offsetEl.offsetLeft;
                s += offsetEl.scrollTop;
                offsetEl = offsetEl.offsetParent;
            }

            return {
                top: t,
                left: l,
                scroll: s
            };
        },

        _getPageBottomSpace: function () {
            return _d.documentElement.scrollHeight - (event._getEditorOffsets(null).top + context.element.topArea.offsetHeight);
        },

        _onStickyToolbar: function (inlineOffset) {
            const element = context.element;

            if (!core._isInline && !options.toolbarContainer) {
                element._stickyDummy.style.height = element.toolbar.offsetHeight + 'px';
                element._stickyDummy.style.display = 'block';
            }

            element.toolbar.style.top = (options.stickyToolbar + inlineOffset) + 'px';
            element.toolbar.style.width = core._isInline ? core._inlineToolbarAttr.width : element.toolbar.offsetWidth + 'px';
            util.addClass(element.toolbar, 'se-toolbar-sticky');
            core._sticky = true;
        },

        _offStickyToolbar: function () {
            const element = context.element;

            element._stickyDummy.style.display = 'none';
            element.toolbar.style.top = core._isInline ? core._inlineToolbarAttr.top : '';
            element.toolbar.style.width = core._isInline ? core._inlineToolbarAttr.width : '';
            element.editorArea.style.marginTop = '';

            util.removeClass(element.toolbar, 'se-toolbar-sticky');
            core._sticky = false;
        },

        _codeViewAutoHeight: function () {
            if (core._variable.isFullScreen) return;
            context.element.code.style.height = context.element.code.scrollHeight + 'px';
        },



        _resizeObserver: null,
        _toolbarObserver: null,
        _addEvent: function () {
            const eventWysiwyg = options.iframe ? core._ww : context.element.wysiwyg;
            if (util.isResizeObserverSupported) {
                this._resizeObserver = new _w.ResizeObserver(function(entries) {
                    core.__callResizeFunction(-1, entries[0]);
                });
            }

            /** toolbar event */
            context.element.toolbar.addEventListener('mousedown', event._buttonsEventHandler, false);
            context.element._menuTray.addEventListener('mousedown', event._buttonsEventHandler, false);
            context.element.toolbar.addEventListener('click', event.onClick_toolbar, false);
            /** resizingBar */
            if (context.element.resizingBar) {
                if (/\d+/.test(options.height) && options.resizeEnable) {
                    context.element.resizingBar.addEventListener('mousedown', event.onMouseDown_resizingBar, false);
                } else {
                    util.addClass(context.element.resizingBar, 'se-resizing-none');
                }
            }
            
            /** set response toolbar */
            event._setResponsiveToolbar();

            /** responsive toolbar observer */
            if (util.isResizeObserverSupported) this._toolbarObserver = new _w.ResizeObserver(core.resetResponsiveToolbar);
            
            /** window event */
            _w.addEventListener('resize', event.onResize_window, false);
            if (options.stickyToolbar > -1) {
                _w.addEventListener('scroll', event.onScroll_window, false);
            }
        },


        _setResponsiveToolbar: function () {
            if (_responsiveButtons.length === 0) {
                _responsiveButtons = null;
                return;
            }

            event._responsiveCurrentSize = 'default';
            const sizeArray = event._responsiveButtonSize = [];
            const buttonsObj = event._responsiveButtons = {default: _responsiveButtons[0]};
            for (let i = 1, len = _responsiveButtons.length, size, buttonGroup; i < len; i++) {
                buttonGroup = _responsiveButtons[i];
                size = buttonGroup[0] * 1;
                sizeArray.push(size);
                buttonsObj[size] = buttonGroup[1];
            }

            sizeArray.sort(function (a, b) { return a - b; }).unshift('default');
        }
    };

    /** functions */
    const functions = {
        core: core,
        util: util,

        onload: null,
        onScroll: null,
        onMouseDown: null,
        onClick: null,
        onInput: null,
        onKeyDown: null,
        onKeyUp: null,
        onCopy: null,
        onCut: null,
        onFocus: null,
        
        onBlur: null,

        onChange: null,

        onSave: null,

        onDrop: null,
        onPaste: null,

        showInline: null,

        showController: null,

        toggleCodeView: null,

        toggleFullScreen: null,

        imageUploadHandler: null,

        videoUploadHandler: null,
        audioUploadHandler: null,
        onImageUploadBefore: null,
        onVideoUploadBefore: null,
        onAudioUploadBefore: null,

        onImageUpload: null,
        onVideoUpload: null,
        onAudioUpload: null,

        onImageUploadError: null,
        onVideoUploadError: null,
        onAudioUploadError: null,

        onResizeEditor: null,

        onSetToolbarButtons: null,

        setToolbarButtons: function (buttonList) {
            core.submenuOff();
            core.containerOff();
            core.moreLayerOff();
            
            const newToolbar = _Constructor._createToolBar(_d, buttonList, core.plugins, options);
            _responsiveButtons = newToolbar.responsiveButtons;
            event._setResponsiveToolbar();

            context.element.toolbar.replaceChild(newToolbar._buttonTray, context.element._buttonTray);
            const newContext = _Context(context.element.originElement, core._getConstructed(context.element), options);

            context.element = newContext.element;
            context.tool = newContext.tool;
            if (options.iframe) context.element.wysiwyg = core._wd.body;

            core._recoverButtonStates();
            core._cachingButtons();
            core.history._resetCachingButton();

            core.effectNode = null;
            if (core.hasFocus) event._applyTagEffects();
            if (core.isReadOnly) util.setDisabledButtons(true, core.resizingDisabledButtons);
            if (typeof functions.onSetToolbarButtons === 'function') functions.onSetToolbarButtons(newToolbar._buttonTray.querySelectorAll('button'), core);
        },

        save: function () {
            const contents = core.getContents(false);
            context.element.originElement.value = contents;
        },


        readOnly: function (value) {
            core.isReadOnly = value;
             // toolber enable
            util.setDisabledButtons(!!value, core.resizingDisabledButtons);

            if (value) {
                /** off menus */
                //core.controllersOff();
                if (core.submenuActiveButton && core.submenuActiveButton.disabled) core.submenuOff();
                if (core._moreLayerActiveButton && core._moreLayerActiveButton.disabled) core.moreLayerOff();
                if (core.containerActiveButton && core.containerActiveButton.disabled) core.containerOff();
                if (core.modalForm) core.plugins.dialog.close.call(core);

                context.element.code.setAttribute("readOnly", "true");
                util.addClass(context.element.wysiwygFrame, 'se-read-only');
            } else {
                context.element.code.removeAttribute("readOnly");
                util.removeClass(context.element.wysiwygFrame, 'se-read-only');
            }

            if (options.codeMirrorEditor) options.codeMirrorEditor.setOption('readOnly', !!value);
        },

        disable: function () {
            this.toolbar.disable();
            this.wysiwyg.disable();
        },

         disabled: function () {
            this.disable();
        },

        enable: function () {
            this.toolbar.enable();
            this.wysiwyg.enable();
        },

         enabled: function () {
            this.enable();
        },

        show: function () {
            const topAreaStyle = context.element.topArea.style;
            if (topAreaStyle.display === 'none') topAreaStyle.display = options.display;
        },

        hide: function () {
            context.element.topArea.style.display = 'none';
        },

        toolbar: {
            disable: function () {
                /** off menus */
                core.submenuOff();
                core.moreLayerOff();
                core.containerOff();

                context.tool.cover.style.display = 'block';
            },

            disabled: function () {
                this.disable();
            },

            enable: function () {
                context.tool.cover.style.display = 'none';
            },

             enabled: function () {
                this.enable();
            },

            show: function () {
                if (core._isInline) {
                    event._showToolbarInline();
                } else {
                    context.element.toolbar.style.display = '';
                    context.element._stickyDummy.style.display = '';
                }

                event.onResize_window();
            },

            hide: function () {
                if (core._isInline) {
                    event._hideToolbar();
                } else {
                    context.element.toolbar.style.display = 'none';
                    context.element._stickyDummy.style.display = 'none';
                }

                event.onResize_window();
            },
        },

    };

    /************ Core init ************/
    // functions
    core.functions = functions;
    core.options = options;

    // Create to sibling node
    let contextEl = context.element;
    let originEl = contextEl.originElement;
    let topEl = contextEl.topArea;
    originEl.style.display = 'none';
    topEl.style.display = 'block';

    // init
    if (options.iframe) {
        contextEl.wysiwygFrame.addEventListener('load', function () {
            util._setIframeDocument(this, options);
            core._editorInit(false, options.value);
            options.value = null;
        });
    }

    // insert editor element
    if (typeof originEl.nextElementSibling === 'object') {
        originEl.parentNode.insertBefore(topEl, originEl.nextElementSibling);
    } else {
        originEl.parentNode.appendChild(topEl);
    }

    contextEl.editorArea.appendChild(contextEl.wysiwygFrame);
    contextEl = originEl = topEl = null;

    // init
    if (!options.iframe) {
        core._editorInit(false, options.value);
        options.value = null;
    }

    return functions;
}
