#!/usr/bin/env node

var fs = require("fs");
var { exec } = require("child_process");
var arg = process.argv[2];
var ejs = require("ejs");
var currentPath = process.cwd();
var express = require('express');
var serveStatic = require('serve-static');
var serveIndex = require('serve-index');
var SocketServer = require('ws').Server;
var chokidar = require('chokidar');
var child = require('child_process');
var d3 = require("d3v4");

function compile() {

	let script = fs.readFileSync("src/script.js", "utf8");

	let c = child.exec("lessc src/style.less " + currentPath + "/build/style.css", (err, stdout, stderr) => {

		if (err) { console.log(err); }

	}).on("exit", function(){

        let doc = fs.readFileSync("doc.json", "utf8");
        doc = JSON.parse(doc);

        let posall = [];

        let sizes = ["desktop", "tablet", "mobile"];
        
        sizes.forEach(function(size){
                let pos = fs.readFileSync("pos-" + size + ".json", "utf8");
                pos = JSON.parse(pos);

                posall.push({
                    size: size,
                    pos: pos
                })

        });

        let html = fs.readFileSync("src/index.jst.html", "utf8");
        let ejs_rendered = ejs.render(html, {doc: doc, pos: posall, d3: d3});

        let out = "";

        out += "<!DOCTYPE html>\n";
        out += '<html>\n';
        out += '<head>\n';
        out += '<title>法庭線</title>\n';
        out += '<meta charset="utf-8"> \n';
        out += '<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0">\n';

        let style = fs.readFileSync("build/style.css", "utf8");

        out += "<style>\n";
        out += style;
        out += "</style>\n";

        out += '</head>\n';
        out += '<body>\n';

        out += ejs_rendered;
        out += '<script src="d3_.js"></script>';

        out += "\n<script>\n";
        out += script;
        out += "\n</script>\n";

        out += '</body>\n'
        out += '</html>\n'

        fs.writeFileSync("index.html", out);

	})
}

compile();

fs.watch('src', (eventType, filename) => {
	console.log(filename + " changed...");
	compile();
})

fs.watch('doc.json', (eventType, filename) => {
	console.log(filename + " changed...");
	compile();
})

// // this is from https://github.com/1wheel/hot-server

var defaults = {port: 3999, dir: currentPath} 
var args = require('minimist')(process.argv.slice(2))
var {port, dir} = Object.assign(defaults, args)
dir = require('path').resolve(dir) + '/'

// set up express static server with a websocket
var server = express()
	.get('*', injectHTML)
	.use(serveStatic(dir))
	.use('/', serveIndex(dir))
	.listen(port)
	.on('listening', () => {
		child.exec('open http://localhost:' + port)
		console.log('hot-server http://localhost:' + port)
	})

	
// process.on('uncaughtException', (err => 
	// err.errno == 'EADDRINUSE' ? server.listen(++port) : 0)) //inc port if in use

// append websocket/injecter script to all html pages served
// var wsInject = fs.readFileSync('bin/ws-inject.html', 'utf8')

function injectHTML(req, res, next){
	try{
		var path = req.params[0].slice(1)
		if (path.slice(-1) == '/') path = path + '/index.html'
		if (path == '') path = 'index.html'
		if (path.slice(-5) != '.html') return next()

		res.send(fs.readFileSync(dir + path, 'utf-8') + wsInject)
	} catch(e){ next() }
}

// // if a .js or .css files changes, load and send to client via websocket
// var wss = new SocketServer({server})
// chokidar
// 	.watch(dir, {ignored: /node_modules|\.git|[\/\\]\./ })
// 	.on('change', path => {
// 		var str = fs.readFileSync(path, 'utf8')
// 		var path = '/' + path.replace(__dirname, '')

// 		var type = 'reload'
// 		if (path.includes('.js'))  type = 'jsInject'
// 		if (path.includes('.css')) type = 'cssInject'

// 		var msg = {path, type, str}
// 		wss.clients.forEach(d => d.send(JSON.stringify(msg)))
// 	})