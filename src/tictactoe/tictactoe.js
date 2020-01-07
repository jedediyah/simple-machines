/*
Jedediyah Williams
jedediyah.com
January, 2020
*/

// Tic Tac Toe
var turn = 'X';
var board = [['','',''],['','',''],['','','']];
var board_states = [];
var game_over = false; 
var game_mode = 0; // Human v. Human.  game_mode=1 corresponds to Human v. Machine

function update_board_div() {
    document.getElementById('ttt00').innerHTML = board[0][0];
    document.getElementById('ttt01').innerHTML = board[0][1];
    document.getElementById('ttt02').innerHTML = board[0][2];
    document.getElementById('ttt10').innerHTML = board[1][0];
    document.getElementById('ttt11').innerHTML = board[1][1];
    document.getElementById('ttt12').innerHTML = board[1][2];
    document.getElementById('ttt20').innerHTML = board[2][0];
    document.getElementById('ttt21').innerHTML = board[2][1];
    document.getElementById('ttt22').innerHTML = board[2][2];
}

function new_game(game_type) {
    turn = 'X'; 
    board = [['','',''],['','',''],['','','']];
    ttt_tree.highlight_sequence(board_states,'#DDD');
    board_states = [];
    update_board_div();     
    console.log('starting new game');  
    game_over = false; 
}

function check_for_win() {
    if ((board[0][0]=='X' || board[0][0]=='O') && board[0][0]==board[0][1] && board[0][1]==board[0][2]) { return board[0][0]; }
    if ((board[1][0]=='X' || board[1][0]=='O') && board[1][0]==board[1][1] && board[1][1]==board[1][2]) { return board[1][0]; }
    if ((board[2][0]=='X' || board[2][0]=='O') && board[2][0]==board[2][1] && board[2][1]==board[2][2]) { return board[2][0]; }
    
    if ((board[0][0]=='X' || board[0][0]=='O') && board[0][0]==board[1][0] && board[1][0]==board[2][0]) { return board[0][0]; }
    if ((board[0][1]=='X' || board[0][1]=='O') && board[0][1]==board[1][1] && board[1][1]==board[2][1]) { return board[0][1]; }
    if ((board[0][2]=='X' || board[0][2]=='O') && board[0][2]==board[1][2] && board[1][2]==board[2][2]) { return board[0][2]; }
    
    if ((board[0][0]=='X' || board[0][0]=='O') && board[0][0]==board[1][1] && board[1][1]==board[2][2]) { return board[0][0]; }
    if ((board[0][2]=='X' || board[0][2]=='O') && board[0][2]==board[1][1] && board[1][1]==board[2][0]) { return board[0][2]; }
    return '';
}

function get_state_string() {
    var state = '';
    for (var r=0; r<3; r++) {
        for (var c=0; c<3; c++) {
            if (board[r][c]=='') {
                state += '-';
            } else {
                state += board[r][c];
            }
            if (c==2 && r<2) {
                state += '/'; 
            }
        }
    }
    return state; 
}

function machine_move() {
    var mov_r = 0;
    var mov_c = 0;
    // Enumerate possible moves
    possible_moves = [];
    for (var r=0; r<3; r++) {
        for (var c=0; c<3; c++) {
            if (board[r][c]=='') {
                possible_moves.push([r,c]);
            }
        }
    }	
	// Choose a move based on current game-state
	
	
	ttt_click(mov_r, mov_c);  // Execute a move
}

function ttt_click(r,c) {
    if (game_over || board[r][c]!='') { return false; }
    board[r][c] = turn;
    update_board_div(); 
    
    board_states.push( get_state_string() );    
    ttt_tree.highlight_sequence(board_states,'#EFE');
    
    var winner = check_for_win();
    if (winner == 'X') {
        game_over = true; 
        ttt_tree.store_game(board_states,[1.0,0.0]);
    } else if (winner == 'O') {
        game_over = true; 
        ttt_tree.store_game(board_states,[0.0,1.0]);
    } else if ( board[0][0]!='' && board[0][1]!='' && board[0][2]!='' &&
    			board[1][0]!='' && board[1][1]!='' && board[1][2]!='' && 
    			board[2][0]!='' && board[2][1]!='' && board[2][2]!='') {
    	game_over = true; 
    	ttt_tree.store_game(board_states,[0.5,0.5]);
    }
        
    if (turn=='X') { turn = 'O'; }	
    else { turn = 'X'; }
    
    if (!game_over && game_mode == 1 && turn=='O') {
		machine_move();
    }
}
