
import '/src/assets/css/suneditor.css'
import suneditor from '/src/suneditor'
import plugins from '/src/plugins'
//import {en}  from '/src/lang'

let data1 = `
<h1><span style="color: rgb(255, 0, 0)">Hi</span></h1><h3>H3</h3><p><br></p><p><br></p><p>関西システム　　<span style="font-size: 18px;background-color: rgb(209, 178, 255)">機内</span></p><p><span style="font-size: 18px;background-color: rgb(209, 178, 255)"><br></span></p><p><span style="font-size: 18px;background-color: rgb(209, 178, 255)"><br></span></p><p><br></p>
`;

let data2 = `
<div class="se-component se-video-container __se__float-none"><figure style="width: 515px; height: 290px; padding-bottom: 290px;"><iframe src="https://www.youtube.com/embed/OeuxE_frLgw" data-proportion="true" data-size="515px,290px" data-align="none" data-file-name="OeuxE_frLgw" data-file-size="0" data-origin="100%,56.25%" style="width: 515px; height: 290px;"></iframe></figure></div><h1><span style="color: rgb(255, 0, 0)">Hi</span></h1><h3>H3</h3><p><br></p><p><br></p><p>関西システム　　<span style="font-size: 18px;background-color: rgb(209, 178, 255)">機内</span></p><p><span style="font-size: 18px;background-color: rgb(209, 178, 255)"><br></span></p><p><span style="font-size: 18px;background-color: rgb(209, 178, 255)"><br></span></p><p><br></p>
`;

let ta = document.querySelector("#textarea")
ta.value = data2;


let editor = suneditor.create('textarea', {
    plugins: plugins,
    buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['paragraphStyle', 'blockquote'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        '/', // Line break
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'],
        ['table', 'link', 'image', 'video', 'audio' ], // You must add the 'katex' library at options to use the 'math' plugin.
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print'],
        ['save', 'template'],
    ],
    resizingBar : false,
    showPathLabel: false,
    resizeEnable: true,
})

editor.readOnly(true);
editor.toolbar.hide();


// You can also load what you want
/*
suneditor.create('textarea', {
    plugins: [plugins.font],
    // Plugins can be used directly in the button list
    buttonList: [
        ['font', plugins.image]
    ]
})
*/

document.querySelector("#edit").onclick = () => {
       editor.readOnly(false);
       editor.toolbar.show();

};
document.querySelector("#view").onclick = () => {
       editor.readOnly(true);
       editor.toolbar.hide();
       editor.save();

};

document.querySelector("#save").onclick = () => {
        editor.save();
	let ta = document.querySelector("#textarea")
	console.log(ta.value);
};


