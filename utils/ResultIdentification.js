
    //hàm xác định kết quả hòa khi đánh kín bàn cờ
    //input: square: bàn cờ
    //output: true: kết quả hòa, false: chưa kết thúc ván đấu
const isDrawn = (board) =>{
    return board.every(value => value !==null);
};

    //hàm phân định thắng thua 
    //Luật chơi: cứ 5 dấu liên tiếp sẽ giành chiến thắng , bất kể có bị chặn hay ko
    //input: square: bàn cờ hiện tại, position: vị trí đánh, maxSize: kích cỡ bàn cờ, maxStep: bước để thắng
    //output: {
    //      winner: người chiến thắng 
    //      line: đường đánh chiến thắng
    //      }
const calculateWinner= (board,position,maxSize,maxStep) =>{
    let size = maxSize;
    let line =[];
    const i = Math.floor(position /size);
    const j = Math.floor(position % size);
    
    //B1: tạo ma trận 2 chiều từ mảng board 1 chiều 
    let matrix = [];
    for (let i =0 ; i< board.length; i+= maxSize)
    {
        matrix.push(board.slice(i,maxSize+i));
    }

    //B2: kiểm tra theo hướng hàng ngang dưa trên vị trí vừa đánh
    for (let k = 0; k< size;k++)
    {
        if (board[position] && matrix[i][k]===board[position])
        {
            line.push(size*i+k);

        }
        else if(line.length !==0)
        {
            break;
        }
    }

    if (line.length >= maxStep)
    {
        return {
            msg: board[position],
            line: line,
        }
    }
    line = [];
    //B3: kiểm tra theo hướng cột dọc dưa trên vị trí vừa đánh
    for (let k = 0; k< size;k++)
    {
        if (board[position] && matrix[k][j]===board[position])
        {
            line.push(size*k+j);
        }
        else if(line.length !==0)
        {
            break;
        }
    }

    if (line.length >= maxStep)
    {
        return {
            msg: board[position],
            line: line,
        };
    }
    line = [];
    //B4: kiểm tra theo hướng từ điểm trái trên tới phải dưới dưa trên vị trí vừa đánh
    let row = 0, col = 0;
    i>j? row = i-j: col = j-i;
    for(let k=0;k<maxSize;k++)
    {
        
        if(row+k < maxSize && col+k<maxSize)
        {
            if (board[position] && matrix[row+k][col+k]===board[position])
            {
                line.push((row+k)*size + col+k);
            }
            else if(line.length !==0)
            {
                break;
            }
        }
        else
        {
            break;
        }
    }
    
    if (line.length >= maxStep)
    {
        return {
            msg: board[position],
            line: line,
        };
    }
    line = [];
    //B5: kiểm tra theo hướng từ điểm phải trên tới trái dưới dưa trên vị trí vừa đánh
    col =0;
    row = 0;  
    if (i + j > maxSize -1)
    {
        col = maxSize - 1;
        row = i+j - (maxSize -1);
    }
    else
    {
        col = i+j;
    }

    for(let k=0;k<maxSize;k++)
    {
        
        if(row + k <maxSize && col - k >= 0)
        {
            if (board[position] && matrix[row + k][col - k]===board[position])
            {
                line.push((row+k)*maxSize +col -k);
            }
            else if(line.length !==0)
            {
                break;
            }
        }
        else
        {
            break;
        }
    }

    if (line.length >= maxStep)
    {
        return {
            msg: board[position],
            line: line,
        };
    }

    //B6: Kiểm tra xem ván đấu có hòa hay không 
    if (isDrawn(board))
    {
        return {
            msg: "Draw",
            line: null
        };
    }
    // B7: return null nếu không có điều kiện nào thỏa
    return null;
};


module.exports = ResultIdentification = {
    isDrawn,
    calculateWinner,
}