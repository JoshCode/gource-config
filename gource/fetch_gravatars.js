const fs = require('fs');
const { execSync } = require('child_process');

if(!fs.existsSync('./avatars')) {
  fs.mkdirSync('./avatars')
}

let authors[] = execSync('git log --pretty=format:"%ae|%an').toString().split('\n');
console.log(authors);
