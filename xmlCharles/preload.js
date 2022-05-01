const fs = require('fs')
const mineType = require("mime-types")
const path = require('path');
window.pluginInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'plugin.json')));

window.selectFile = () => {
    return utools.showOpenDialog({
        title: "请选择要上传的xml",
        defaultPath: utools.getPath("downloads"),
        buttonLabel: "确定",
        properties: ["openFile"],
        filters: [{ name: 'Xml', extensions: ['xml'] }]
    });

};
window.readFile = (filePath, callback = undefined) => {
    console.log('filePath', filePath);
    const base64 = window.fileToBase64(filePath)
    const fileName = path.basename(filePath)
    console.log('fileName', fileName);
    let filename = fileName
    if (callback) {
        filename = callback(fileName)
    }
    console.log('fileName', filename);
    const file = dataURLtoFile(base64, filename)
    console.log('filename', file.name);
    return file
}
fileToBase64 = filePath => {
    let data = fs.readFileSync(filePath);
    data = new Buffer(data).toString("base64");
    console.log(data);
    let base64 = "data:" + mineType.lookup(filePath) + ";base64," + data;
    console.log(base64);
    return base64;
};
window.dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};