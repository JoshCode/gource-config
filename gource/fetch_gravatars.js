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
let authorlist = {}

for (let i = 0; i < authors.length; i++) {
	let split = authors[i].split("|");
	authorlist[`${split[1]}`] = {
		name: split[1],
		email: split[0]
	}
}

let authorlistkeys = Object.keys(authorlist);
console.log(authorlist);
console.log(authorlistkeys);

for (let i = 0; i < authorlistkeys.length; i++) {
	let author = authorlist[authorlistkeys[i]];
	author.email = author.email.trim().toLowerCase();
	console.log(`Fetching for '${author.name}': ${author.email}`)
	let hash = crypto.createHash('md5').update(author.email).digest("hex")
	let url = `http://www.gravatar.com/avatar/${hash}?d=404&r=g&size=${size}`
	console.log(`  url: ${url}`)
	let promise = download(url, `${output_dir}/${author.name}.png`)
	promise.then(() => {
		console.log(`Fetching for '${author.name}': ${author.email} complete`)
	});
	promises.push(promise);
}

Promise.all(promises).then(() => {
	console.log("All fetching complete");
	process.exit(0);
})
