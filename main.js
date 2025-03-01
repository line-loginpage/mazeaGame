var game=1;//ゲームをプレイ中だと1,クリアしたら0

const canvas = document.getElementById("canvas");//HTMLのcanvasを取得

const ctx = canvas.getContext("2d");//2D描画の準備

const inclination = canvas.height / canvas.width;//平行線を一点透視図法で描画したときの傾きの指標

const text = document.getElementById("text");//マップ表示テキスト
const height = 21, width = 21;//ここまでは含まれない　奇数のほうがいいよ
const directionArray = [//向き
    [-1, 0], [0, 1], [1, 0], [0, -1]
];
const mazeArray = [];//1が壁、0は道
const mapArray=[];

var yx = [1, 1];//プレイヤーの座標
var direction = 2;//プレイヤーの向き

const blockSize = 2;

const arctanRatio = [[],[]];//何ブロック先のモノをどの場所に描画すればいいか
let ratio = canvas.width / Math.PI;//弧度法と画面の視野での比率
for (let i = 0; i <= Math.max(width, height); i++) {
    arctanRatio[0].push(Math.floor(Math.atan(i * 2) * ratio));
}
for (let i = 0; i <= Math.max(width, width); i++) {
    arctanRatio[1].push(canvas.width - arctanRatio[0][i]);
}

var img = new Image();
  img.src = "goal.jpg";

let up = document.getElementById('up');
let down = document.getElementById('down');
let left = document.getElementById('left');
let right = document.getElementById('right');

document.addEventListener('keydown', function (event) {
    if(!game){return}
    switch (event.key) {
        case 'ArrowUp':
            newYX = judgement(undefined, undefined, direction);
            if (newYX !== false) {
                yx = newYX;
                drawScreen();
            }
            break;
        case 'ArrowLeft':
            direction--;
            direction = (direction + 4) % 4;
            drawScreen();
            break;
        case 'ArrowRight':
            direction++;
            direction %= 4;
            drawScreen();
            break;
    }
    
    if(yx[0]==height-2&&yx[1]==width-2){
        game=0;
        text.textContent="GAME CLEAR!"
    }

});

// 迷路の配列を作成
for (let i = 0; i < height; i++) {
    mazeArray.push(new Array(width).fill(0));
    mapArray.push(new Array(width).fill(1));
}
mapArray[width-2][height-2]=2;

function init() {
    for (let y = 0; y < height; y++) {//迷路を作成
        for (let x = 0; x < width; x++) {
            if(x==2&&y==2){
                mazeArray[1][2]=1;
                mazeArray[y][x]=1;
            }else if(x==width-2&&y==height-2){
                mazeArray[y][x]=2;
            }else if (y== 0 || x == 0 || y == height - 1 || x == width - 1 || (y % 2 == 0 && x % 2 == 0)) {
                mazeArray[y][x] = 1;
                if (!(y == 0 || x == 0 || y == height - 1 || x == width - 1)) {
                    while (1) {
                        let number = judgement(y, x, Math.floor(Math.random() * 4));
                        if (number !== false) {
                            mazeArray[number[0]][number[1]] = 1;
                            break;
                        }
                    };
                }
            }
        }
    }


}

function judgement(y = yx[0], x = yx[1], direction2) {//座標が変更できるか判定
    let newY = y + directionArray[direction2][0];
    let newX = x + directionArray[direction2][1];

    if (newY <= 0 || newY >= height || newX <= 0 || newX >= width || mazeArray[newY][newX] === 1) {
        return false;
    }
    return [newY, newX];//変更が可能な場合変更後の座標の配列を返す
}

 

function drawMap() {//マップ表示関数
    text.innerHTML = "";
    for (let y = 0; y < mazeArray.length; y++) {
        let rowText = '';  // 行ごとの文字列を一時的に保持する変数
        for (let x = 0; x < mazeArray[0].length; x++) {
            if (y !== yx[0] || x !== yx[1]) {
                let t = "";
                switch(mapArray[y][x]){
                    case 0:t="　";break;
                    case 1:t="■";break;
                    case 2:t="　";break;
                }
                rowText += t;
            } else {
                switch (direction) {
                    case 0: rowText += "↑"; break;
                    case 1: rowText += "→"; break;
                    case 2: rowText += "↓"; break;
                    case 3: rowText += "←"; break;
                }
                mapArray[y][x]=0;
            }
        }
        text.innerHTML += rowText + '<br>';  // 行が終わったら改行を追加
    }
}

function drawHorizontalLine(blockDistance, leftOrRight) {//横の線を描く
    if (!blockDistance) {
        return;
    }
    let x = arctanRatio[leftOrRight][blockDistance];
    let y = 0;
    if (leftOrRight) {
        y = (x - Math.floor(canvas.width / 2)) * inclination + Math.floor(canvas.height / 2);
    } else {
        y = (Math.floor(canvas.width / 2) - x) * inclination + Math.floor(canvas.height / 2);
    }

    ctx.beginPath();        // 新しいパスを開始
    ctx.moveTo(x, y);     // 線の始点を設定（x, y）
    ctx.lineTo(arctanRatio[leftOrRight][blockDistance - 1], y);   // 線の終点を設定（x, y）
    ctx.stroke();           // パスを描画

    ctx.beginPath();        // 新しいパスを開始
    ctx.moveTo(x, canvas.height - y);     // 線の始点を設定（x, y）
    ctx.lineTo(arctanRatio[leftOrRight][blockDistance - 1], canvas.height - y);   // 線の終点を設定（x, y）
    ctx.stroke();           // パスを描画
}

function drawVerticalLine(blockDistance, leftOrRight) {//縦の線を描く
    let x = arctanRatio[leftOrRight][blockDistance];
    let y = 0;
    if (leftOrRight) {
        y = (x - Math.floor(canvas.width / 2)) * inclination + Math.floor(canvas.height / 2);
    } else {
        y = (Math.floor(canvas.width / 2) - x) * inclination + Math.floor(canvas.height / 2);
    }

    ctx.beginPath();        // 新しいパスを開始
    ctx.moveTo(x, y);     // 線の始点を設定（x, y）
    ctx.lineTo(x, canvas.height - y);   // 線の終点を設定（x, y）
    ctx.stroke();           // パスを描画
}

function drawDiagonalLine(blockDistance, leftOrRight) {//スクリーンの座標から消失点への直線を引く関数 leftOrRightは0,1で0だと左、1だと右
    let x = arctanRatio[leftOrRight][blockDistance];
    let y = 0;
    if (leftOrRight) {
        y = (x - Math.floor(canvas.width / 2)) * inclination + Math.floor(canvas.height / 2);
    } else {
        y = (Math.floor(canvas.width / 2) - x) * inclination + Math.floor(canvas.height / 2);
    }

    let newX = arctanRatio[leftOrRight][blockDistance + 1];
    let newY = 0;
    if (leftOrRight) {
        newY = (newX - Math.floor(canvas.width / 2)) * inclination + Math.floor(canvas.height / 2);
    } else {
        newY = (Math.floor(canvas.width / 2) - newX) * inclination + Math.floor(canvas.height / 2);
    }

    ctx.beginPath();        // 新しいパスを開始
    ctx.moveTo(x, y);     // 線の始点を設定（x, y）
    ctx.lineTo(newX, newY);   // 線の終点を設定（x, y）
    ctx.stroke();           // パスを描画

    ctx.beginPath();        // 新しいパスを開始
    ctx.moveTo(x, canvas.height - y);     // 線の始点を設定（x, y）
    ctx.lineTo(newX, canvas.height - newY);   // 線の終点を設定（x, y）
    ctx.stroke();           // パスを描画
}

function drawScreen() {
    let nowY = yx[0], nowX = yx[1];
    nowY += directionArray[direction][0];
    nowX += directionArray[direction][1];
    let drawArray = [[], []];//向かって左側が0描写すべきマスの情報だけを取り出した配列
    while (1) {
        if (mazeArray[nowY][nowX]) {
            if(mazeArray[nowY][nowX]==2){
                drawArray.push([]);
            }
            break;
        }

        let nowY2 = nowY + directionArray[(direction + 3) % 4][0];
        let nowX2 = nowX + directionArray[(direction + 3) % 4][1];
        drawArray[0].push(mazeArray[nowY2][nowX2]);
        nowY2 = nowY + directionArray[(direction + 1) % 4][0];
        nowX2 = nowX + directionArray[(direction + 1) % 4][1];
        drawArray[1].push(mazeArray[nowY2][nowX2]);

        nowY += directionArray[direction][0];
        nowX += directionArray[direction][1];
    }
    nowY = yx[0];
    nowX = yx[1];

    //描写処理
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < drawArray.length; i++) {
        if(i==2){
                let x=arctanRatio[0][drawArray[0].length];
                let y=(Math.floor(canvas.width / 2) - arctanRatio[0][drawArray[0].length]) * inclination + Math.floor(canvas.height / 2);
                ctx.drawImage(img, x, y, canvas.width-2*x,canvas.height-2*y);
                break;
        }
        for (let j = 0; j <= drawArray[i].length; j++) {
            if (drawArray[i][j]) {
                drawDiagonalLine(j, i);
                if (!drawArray[i][j - 1]) {
                    drawVerticalLine(j, i);
                    drawHorizontalLine(j, i);
                }
                if (!drawArray[i][j + 1]) {
                    drawVerticalLine(j + 1, i);
                }
                
            }else if(j==drawArray[i].length){
                if (!drawArray[i][j - 1]) {
                    drawHorizontalLine(j, i);
                }
            }
        }
    }

    ctx.beginPath();        // 新しいパスを開始
    ctx.moveTo(arctanRatio[0][drawArray[0].length],(Math.floor(canvas.width / 2) - arctanRatio[0][drawArray[0].length]) * inclination + Math.floor(canvas.height / 2));     // 線の始点を設定（x, y）
    ctx.lineTo(arctanRatio[1][drawArray[0].length],(Math.floor(canvas.width / 2) - arctanRatio[0][drawArray[0].length]) * inclination + Math.floor(canvas.height / 2));   // 線の終点を設定（x, y）
    ctx.stroke();           // パスを描画

    ctx.beginPath();        // 新しいパスを開始
    ctx.moveTo(arctanRatio[0][drawArray[0].length],(arctanRatio[0][drawArray[0].length] - Math.floor(canvas.width / 2)) * inclination + Math.floor(canvas.height / 2));     // 線の始点を設定（x, y）
    ctx.lineTo(arctanRatio[1][drawArray[0].length],(arctanRatio[0][drawArray[0].length] - Math.floor(canvas.width / 2)) * inclination + Math.floor(canvas.height / 2));   // 線の終点を設定（x, y）
    ctx.stroke();           // パスを描画

    drawMap();
}

init();
drawScreen();