#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var util = require('util');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

/*
var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};
*/

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlstring, checksfile) {
//    $ = cheerioHtmlFile(htmlfile);
    $ = cheerio.load(htmlstring);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
//	console.error("checking %s", checks[ii]);
	var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
//        out[checks[ii]] = $(checks[ii]).length;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var html2string = function(result, response) {
    if (result instanceof Error) {
	console.error('Error: ' + util.format(response.message));
	return false;
    } else {
	return response;
    }
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Read index.html from URL')
        .parse(process.argv);
//    var input = "";
    if (program.url) {
//	input = rest.get(program.url).on('complete', html2string);
	rest.get(program.url).on('complete', function(result, response) {
	    if (result instanceof Error) {
		if (response) {
		    console.error('Error: ' + util.format(response.message));
		} else {
		    console.error('Error getting url %s', program.url);
		}
	    } else {
//		input = result;
		var checkJson = checkHtmlFile(result, program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
	    }
	})
    } else {
	input = fs.readFileSync(program.file);
	// there has to be a better way of doing this, but when i have the
	// following code outside of the rest.get... call, it gets run before
	// the url get finishes.
	// control flow libraries like this are SCARY for someone not used to
	// completely async programming.  can't get my head, at 5.41am, around
	// when javascript is syncronous and async
	// http://stackoverflow.com/questions/6048504/synchronous-request-in-nodejs
	//
	// it's possibly just be wrapping checkJson, outJson, and console.log
	// into one function
	var checkJson = checkHtmlFile(input, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
