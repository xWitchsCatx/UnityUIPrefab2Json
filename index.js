const fs = require('fs');
const os = require('os');

let targetFile = null;
const len = process.argv.length;

for (let i = 0; i < len; i++) {
    let element = process.argv[i];
    if(element === '-in')
        targetFile = process.argv[i + 1];
}

if(targetFile === null)
{
    console.log('Usage: unityuiprefab2json -in <path> -out <path>');
    return process.exit(0);
}

function readNextObject(lines, index) {
    let rs = {
        obj : undefined,
        nextIndex : index,
    };

    const length = lines.length;
    while(index < length) {
        let line = lines[index];
        //too short ?
        if(line.length < 3) {
            index++;
            continue;
        }
        //
        if(line.startsWith('---')) {

        }
    }
}

function readObject(lines, index) {

}

// fs.readFile(targetFile, (err, data) => {
//     if(err != null) {
//         return console.log('Read file Error', err);
//     }
    
//     const lines = data.toString().split(os.EOL);
//     const length = lines.length;
//     let objs = [];
//     let index = 0;

//     while(index < length) {
//         let newObj = readNextObject(lines, index);
//         index = newObj.nextIndex;
//         if(newObj.obj != undefined) {
//             objs.push(newObj.obj);
//         }
//     }

// });



// const obj = [{
//     a: 1,
//     b: 2,
//     c: 3
// }, 2]

// console.log(JSON.parse('[{"a":1,"b":2,"c":3},2]'));

// fs.writeFileSync('./out.json', JSON.stringify(obj))
console.log('--- !u!1001 &100100000'.match(/[^-]{3}&([0-9]+)/i)[1]);