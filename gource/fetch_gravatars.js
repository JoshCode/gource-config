const fs     = require('fs'),
	  crypto = require('crypto'),
	  util   = require('util'),
	  http   = require('http'),
	  Stream = require('stream').Transform;
const {execSync} = require('child_process');

let output_dir = "../.git/avatars";
let size = 200;

const download = function (url, filename) {
	return new Promise((resolve, reject) => {
		http.request(url, (res) => {
			var data = new Stream();

			res.on('data', function (chunk) {
				data.push(chunk);
			});

			res.on('end', function () {
				if(res.statusCode === 200) {
					fs.writeFileSync(filename, data.read());
				}
				resolve();
			});
		}).end();
	});
};

if (!fs.existsSync(output_dir)) {
	fs.mkdirSync(output_dir)
}

console.log("Reading git log")
let authors = execSync('git log --pretty=format:"%ae|%an').toString().split('\n');

console.log("Fetching Gravatars")
let promises = [];
for (let i = 0; i < authors.length; i++) {
	let author = authors[i].split("|");
	author[0] = author[0].trim().toLowerCase();
	console.log(`Fetching for '${author[1]}': ${author[0]}`)
	let hash = crypto.createHash('md5').update(author[0]).digest("hex")
	let url = `http://www.gravatar.com/avatar/${hash}?d=404&r=g&size=${size}`
	console.log(`  url: ${url}`)
	let promise = download(url, `${output_dir}/${author[1]}.png`)
	promise.then(() => {
		console.log(`Fetching for '${author[1]}': ${author[0]} complete`)
	});
	promises.push(promise);
}

Promise.all(promises).then(() => {
	console.log("All fetching complete");
	process.exit(0);
})
