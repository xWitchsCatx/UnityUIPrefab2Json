const fs = require('fs');
const os = require('os');

//get file
let targetFile = null;
process.argv = [
    '',
    '-in',
    './testData/Canvas.prefab'
];

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

//=====================================================

const regExStartObj = /(^-{3})([0-9a-zA-Z\!\s]*)&([0-9]+)/i;
const regExProp = /([0-9a-zA-Z_]+):\s([:{}0-9a-zA-Z\s,.-_]+)/i;
const parseXY = (x) => {
    const regRs = x.match(/x:\s([0-9.-]+),\sy:\s([0-9.-]+)/i);
    if (regRs) {
        return {
            x: parseInt(regRs[1]),
            y: parseInt(regRs[2]),
        }
    }
    else {
        console.log("Can't parse XY:" + x);
        return '';
    }
};

const blacklistProp = [
    'Prefab',
    'MonoBehaviour',
    'CanvasRenderer',
    'Canvas',
];
const whitelistProp = {
    m_Name : x => x,
    m_AnchorMin : parseXY,
    m_AnchorMax : parseXY,
    m_AnchoredPosition : parseXY,
    m_SizeDelta : parseXY,
    m_Pivot : parseXY,
    m_GameObject : x => x.match(/fileID:\s(\d+)/i)[1],
};
const supportElement = [
    'BTN',
    'IMG',
];

function readNextObject(lines, index) {
    const length = lines.length;
    let i = index;
    while(i < length) {
        const line = lines[i];
        //start of object ?
        const regRs = line.match(regExStartObj);
        if(regRs) {
            const rs = readObject(lines, i, regRs[3]);
            if(rs) {
                return rs;
            }
        }        
        i++;        
    }
    return undefined;
}

function readObject(lines, index, id) {
    let i = index;
    let rs = {
        obj : {
            id,
        },        
        nextIndex : i,
    };
    
    //read type
    i++;
    let line = lines[i].trim();
    line = line.substr(0, line.length - 1);
    if(blacklistProp.some(x => line === x)) {
        return undefined;
    } else {
        rs.obj["type"] = line;
    }

    const length = lines.length;
    while(i < length) {
        line = lines[i].trim();

        //match object
        let regRs = line.match(regExStartObj);
        if(regRs) {
            rs.nextIndex = i;
            return rs;
        }

        //read prop
        regRs = line.match(regExProp);
        if(regRs) {            
            //white list
            if(Object.prototype.hasOwnProperty.call(whitelistProp, regRs[1])) {
                rs.obj[regRs[1]] = whitelistProp[regRs[1]](regRs[2]);
            }
        }
        i++;
    }
    rs.nextIndex = i;
    return rs;
}

fs.readFile(targetFile, (err, data) => {
    if(err != null) {
        return console.log('Read file Error', err);
    }
    console.log('Read file successful');
    const lines = data.toString().split('\n');
    let length = lines.length;
    let objs = [];
    let index = 0;
    let rs = readNextObject(lines, index);
    while(rs) {
        objs.push(rs.obj);
        index = rs.nextIndex;
        rs = readNextObject(lines, index);
    }

    //filter object
    objs = objs.filter((x) => {
        if(Object.prototype.hasOwnProperty.call(x, 'm_Name')) {
            const split = x['m_Name'].split('_');
            if(split.length < 2) {
                return false;
            }

            if(supportElement.some( x => x === split[0])) {
                x['m_Name'] = split[1];
                x['uiType'] = split[0];
                return true;
            }

            return false;
        } else {
            return true;
        }
    });

    //find rect transform for gameobject
    length = objs.length;
    for(let i = 0; i < length; ++i) {
        let obj = objs[i];
        if(obj.type === 'GameObject') {
            //find its rect transform from end to start
            for(let j = length - 1; j >= 0; --j) {
                let rectTrans = objs[j];
                if(rectTrans.type === 'RectTransform') {
                    if(rectTrans.m_GameObject === obj.id) {
                        //assign data to gameObject
                        obj.m_AnchorMin = rectTrans.m_AnchorMin;
                        obj.m_AnchorMax = rectTrans.m_AnchorMax;
                        obj.m_AnchoredPosition = rectTrans.m_AnchoredPosition;
                        obj.m_SizeDelta = rectTrans.m_SizeDelta;
                        obj.m_Pivot = rectTrans.m_Pivot;
                        break;
                    }
                }
            }
        }
    }

    //filter gameobject
    objs = objs.filter(x => x.type === 'GameObject');

    fs.writeFileSync('./out.json', JSON.stringify(objs))

    process.exit(1);
});



// const obj = [{
//     a: 1,
//     b: 2,
//     c: 3
// }, 2]

// console.log(JSON.parse('[{"a":1,"b":2,"c":3},2]'));

// fs.writeFileSync('./out.json', JSON.stringify(obj))
