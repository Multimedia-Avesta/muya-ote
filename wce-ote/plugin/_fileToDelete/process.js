function calculateHash(fileContents) {
    return sha1.hash(fileContents);
}

function startProcessing(fileInput, onsuccess, onerror, onprogress) {
    var fileList = fileInput[0].files;
    var file = fileList[0];
    var results = {
        name: file.name,
        size: file.size,
        type: file.type,
        hash: ""
    };

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
        results.hash = calculateHash(e.target.result);
        onsuccess(results);
		setTEI(e.target.result);
		parent.tinymce.activeEditor.windowManager.close();
    };
    fileReader.onerror = function(e) {
        onerror(e.target.error.name);
    };
    fileReader.onprogress = function(e) {
        onprogress(e.loaded, e.total);
    };
    //fileReader.readAsArrayBuffer(file);
	fileReader.readAsText(file);
}

function setResults(name, size, type, hash) {
    var table = $("#processResults");
    table.find("#nameValue").text(name);
    table.find("#sizeValue").text(size);
    table.find("#typeValue").text(type);
    table.find("#hashValue").text(hash);
}

function clearResults() {
    $("#processProgress").val(0).show();
    $("#processError").hide();
    $("#processResults").hide();
    setResults("", "", "", "");
}

function populateResults(data) {
    $("#processProgress").val(1);
    $("#processResults").show();
    setResults(data.name, data.size, data.type, data.hash);
}

function populateError(msg) {
    $("#processProgress").hide();
    $("#processError").text("Failed to read file: " + msg);
    $("#processError").show();
}

function populateProgress(loaded, total) {
    $("#processProgress").val(loaded / total);
}

function initialize() {
    $("#fileForm").submit(function(e) {
        e.preventDefault();
        clearResults();
        startProcessing($("#fileInput"), populateResults, populateError, populateProgress);
    });
    clearResults();
}

function setData(msg) {
	parent.tinyMCE.activeEditor.setContent(msg);
}

// get editor html content
function getData() {
	return tinyMCE.activeEditor.getContent();
}
// get TEI String from editor html content
function getTEI() {
	//teiIndexData[0] = tinymce.get(tinyMCE.activeEditor.id).settings.book;
	//teiIndexData[1] = tinymce.get(tinyMCE.activeEditor.id).settings.witness;
	//teiIndexData[2] = tinymce.get(tinyMCE.activeEditor.id).settings.manuscriptLang; 
	return getTeiByHtml(getData(), tinyMCE.activeEditor.settings);
}

// set editor html content from tei input
// teiIndexData can be change
// @param {String} teiStringInput
function setTEI(teiStringInput) {
	var result = getHtmlByTei(teiStringInput, tinyMCE.activeEditor.settings);
	if (result) {
		var htmlContent = result['htmlString'];
		if (htmlContent)
			setData(htmlContent);
	}
	/*var teiIndexData = result['teiIndexData'];
	if (teiIndexData) {
		tinyMCE.activeEditor.teiIndexData = teiIndexData;
	}*/
	//resetCounter(); //for resetting the counter each time this method is called
	return 0;
}

$(document).ready(initialize);
