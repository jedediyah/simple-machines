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
    board_states = [];
    update_board_div();      
    game_over = false; 
    if(game_type=='hvh') {game_mode=0}; // Human v. Human
    if(game_type=='hvm') {game_mode=1}; // Human v. Machine
    if(game_type=='mvm') {game_mode=2}; // Machine v. Machine!
	clear_fill(); // Refresh the game tree
    if(game_mode==2) { machine_move(turn) } // Start game if mvm
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

function machine_move(player) {
    /* player='X'  or  player='O' */

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
	if (possible_moves.length<1) { console.log('No available moves'); return; }
    if (possible_moves.length==1) { console.log('Only one move'); ttt_click(possible_moves[0][0],possible_moves[0][1]); return; }


    known_next_states = current_state_node.children; 
    
    // Current state never seen before
    if (known_next_states==null) {
		console.log('New State'); 
    	// Pick a random move
    	var move = possible_moves[Math.floor(Math.random()*possible_moves.length)];
    	mov_r = move[0];
    	mov_c = move[1];
    }	
	// Current state has been fully enumerated
	else if (known_next_states.length == possible_moves.length) {
		console.log('Fully Enumerated'); 
        var possible_moves = get_possible_moves();
        var best_move_id = 0;
        var best_move = possible_moves[best_move_id]; 
        for (var move_id=1; move_id<possible_moves.length; move_id++) {
            if (player=='X' && possible_moves[move_id][1] > best_move[1]) {
                best_move_id = move_id;
                best_move = possible_moves[best_move_id]; 
            } else if (possible_moves[move_id][1] < best_move[1]) {
                best_move_id = move_id;
                best_move = possible_moves[best_move_id]; 
            }
        }
        var current_rows = get_state_string().split('/');
        var new_rows = best_move[0].split('/');  
        for (var r_id=0;r_id<3;r_id++) {
            if (new_rows[r_id]!=current_rows[r_id]) {
                for (c_id=0;c_id<3;c_id++) {
                    if(current_rows[r_id].charAt(c_id) != new_rows[r_id].charAt(c_id)) {
                        mov_r = r_id;
                        mov_c = c_id;
                    }
                }
            }
        }
	}
	// Current state has been partially enumerated
	else {
		console.log('Partially Enumerated'); 	    
        var known_next_moves = get_possible_moves();
        var best_move_id = 0;
        var best_move = possible_moves[best_move_id]; 
        for (var move_id=1; move_id<known_next_moves.length; move_id++) {
            if (player=='X' && possible_moves[move_id][1] > best_move[1]) {
                best_move_id = move_id;
                best_move = possible_moves[best_move_id]; 
            } else if (possible_moves[move_id][1] < best_move[1]) {
                best_move_id = move_id;
                best_move = possible_moves[best_move_id]; 
            }
        }
        // Check a threshold to accept best_move
        var threshold = 5;  // Hard-coded threshold.
        if (player=='X' && best_move[1]<threshold || player=='O' && best_move[1]>(-threshold)) {
        	// Choose random move from the unknown moves.
        	// First filter out known moves from possible_moves
        	for (var move_id=0; move_id<known_next_moves.length; move_id++) {
        		var move_to_remove = known_next_moves[move_id][0]; 
        		        		
        		var current_rows = get_state_string().split('/');
				var new_rows = move_to_remove.split('/');  
				for (var r_id=0;r_id<3;r_id++) {
				    if (new_rows[r_id]!=current_rows[r_id]) {
				        for (c_id=0;c_id<3;c_id++) {
				            if(current_rows[r_id].charAt(c_id) != new_rows[r_id].charAt(c_id)) {
				                r_rem = r_id;
				                c_rem = c_id;
				            }
				        }
				    }
				}
        		
        		for (var pm_id=0;pm_id<possible_moves.length;pm_id++) {        			
        			if (possible_moves[pm_id][0]==r_rem && possible_moves[pm_id][1]==c_rem) {
        				possible_moves.splice(pm_id,1);
        				break;
        			}
        		}
        	}
        	// Choose a random move
        	var move = possible_moves[Math.floor(Math.random()*possible_moves.length)];
			mov_r = move[0];
			mov_c = move[1];
        }
	}
	
	setTimeout( function(){ttt_click(mov_r,mov_c)},150);
	//ttt_click(mov_r, mov_c);  // Execute a move
}

function ttt_click(r,c) {
    if (game_over || board[r][c]!='') { return false; }
    board[r][c] = turn;
    update_board_div(); 
    
    board_states.push( get_state_string() );    
    
    var winner = check_for_win();
    if (winner == 'X') {
        game_over = true; 
        update_tree(board_states,[1.0,0.0]); 
    } else if (winner == 'O') {
        game_over = true; 
        update_tree(board_states,[0.0,1.0]); 
    } else if ( board[0][0]!='' && board[0][1]!='' && board[0][2]!='' &&
    			board[1][0]!='' && board[1][1]!='' && board[1][2]!='' && 
    			board[2][0]!='' && board[2][1]!='' && board[2][2]!='') {
    	game_over = true; 
        update_tree(board_states,[0.5,0.5]); 
    } else {
        update_tree(board_states); 
    }
        
    if (turn=='X') { turn = 'O'; }	
    else { turn = 'X'; }
    
    if (!game_over && game_mode == 1 && turn=='O') {
		machine_move('O');
    } else if (!game_over && game_mode==2) {
        machine_move('X'); 
    }
    
    if (game_over && game_mode==2) {
	    setTimeout( function(){new_game(2)},800);
	}
    
}

























