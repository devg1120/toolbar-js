import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import  Toolbar  from './jsuites/src/plugins/toolbar.js'
import  Picker  from './jsuites/src/plugins/picker.js'
import  Color  from './jsuites/src/plugins/color.js'
//import  jSuites  from './jsuites/src/jsuites.js'

document.jsuitesComponents = [];

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector('#counter'))

//jSuites.toolbar(document.getElementById('toolbar'), {
Toolbar(document.getElementById('toolbar'), {
    container: true,
    items:[{
            type: 'icon',
            content: 'undo',
            onclick: function() {
                console.log('undo action');
            }
        },
        {
            type: 'icon',
            content: 'redo',
            onclick: function() {
                console.log('redo action');
            }
        },
        {
            type: 'icon',
            content: 'save',
            onclick: function () {
                console.log('save something');
            }
        },
        {
            type: 'label',
            content: 'Text item',
            onclick: function() {
                console.log('action');
            }
        },
        {
            type: 'divisor',
        },
        {
            type: 'select',
            data: [
                'Verdana',
                'Arial',
                'Courier New'
            ],
            width: '160px',
            render: function(e) {
                return '<span style="font-family:' + e + '">' + e + '</span>';
            },
            onchange: function(a,b,c,d) {
                console.log('font-family: ' + d);
            }
        },
        {
            type: 'select',
            data: [
                'x-small',
                'small',
                'medium',
                'large',
                'x-large'
            ],
            content: 'format_size',
            render: function(e) {
                return '<span style="font-size:' + e + '">' + e + '</span>';
            },
            onchange: function(a,b,c,d) {
                console.log('font-size: ' + d);
            }
        },
        {
            type: 'select',
            data: [
                'format_align_left',
                'format_align_center',
                'format_align_right',
                'format_align_justify'
            ],
            render: function(e) {
                return '<i class="material-icons">' + e + '</i>';
            },
            onchange: function(a,b,c,d) {
                if (d == 'format_align_left') {
                    console.log('font-align: left');
                } else if (d == 'format_align_center') {
                    console.log('font-align: center');
                } else if (d == 'format_align_right') {
                    console.log('font-align: right');
                } else if (d == 'format_align_justify') {
                    console.log('font-align: justify');
                }
            }
        },
        {
            type: 'icon',
            content: 'format_bold',
            onclick: function(a,b,c) {
                console.log('font-weight: bold');
                // Control state
                c.toggleState();
            },
            state: true,
            active: true,
        },
        {
            type: 'icon',
            content: 'format_color_text',
            onclick: function(element, instance, item) {
                if (! item.color) {
                    //var colorPicker = jSuites.color(item, {
                    var colorPicker = Color(item, {
                        onchange:function(o, v) {
                            console.log('color:', v);
                        }
                    });
                    colorPicker.open();
                }
            }
        },
        {
            type: 'select',
            data: [
                'border_all',
                'border_outer',
                'border_inner',
                'border_horizontal',
                'border_vertical',
                'border_left',
                'border_top',
                'border_right',
                'border_bottom',
                'border_clear'
            ],
            columns: 5,
            render: function(e) {
                return '<i class="material-icons">' + e + '</i>';
            },
            right: true,
            onload: function(a, b) {
                // Border color
                var container = document.createElement('div');
                var div = document.createElement('div');
                container.appendChild(div);
		    
                //var colorPicker = jSuites.color(div, {
                var colorPicker = Color(div, {
                    onchange: function(o, v) {
                        div.style.color = v;
                    },
                });
		
                var i = document.createElement('i');
                i.classList.add('material-icons');
                i.innerHTML = 'border_color';
                i.onclick = function() {
                    colorPicker.open();
                }
                container.appendChild(i);
                a.children[1].appendChild(container);
 
                var div = document.createElement('div');
		    
                //var picker = jSuites.picker(div, {
                var picker = Picker(div, {
                    content: 'line_style',
                    type: 'select',
                    data: [ 1, 2, 3, 4, 5 ],
                    render: function(e) {
                        return '<div style="height: ' + e + 'px; width: 50px; background-color: black;"></div>';
                    },
                    width: '24px',
                });
		
                a.children[1].appendChild(div);
 
                var div = document.createElement('div');
                div.style.flex = '1'
                a.children[1].appendChild(div);
            }
        }
    ]
});
