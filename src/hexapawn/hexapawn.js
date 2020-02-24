/*
Jedediyah Williams
jedediyah.com
January, 2020
*/

// HeXaPaWn
// Board is defined as
//  [ board00, board01, board[02] ]
//  [ board10, board11, board[12] ]
//  [ board20, board21, board[22] ]
var turn = 'W';
var board = [['B','B','B'],['','',''],['W','W','W']];
var board_states = [];
var game_over = false; 
var game_mode = 0; // Human v. Human.  game_mode=1 corresponds to Human v. Machine
var click_state = 0;   // State machine for user move interaction
var clicked_square = [0,0];  // Row and column of clicked square

// A legal move consists of [[r0,c0],[r1,c1]] where r0,c0 is the current position 
// of a piece and r1,c1 is the target position of that piece.
var legal_moves = [[[2,0],[1,0]],[[2,1],[1,1]],[[2,2],[2,1]]];  

function update_board_div() {
	if (board[0][0]=='W')          { document.getElementById('board00').innerHTML = '<img src="pawnwhite.png">'; }
		else if (board[0][0]=='B') { document.getElementById('board00').innerHTML = '<img src="pawnblack.png">'; }
		else                       { document.getElementById('board00').innerHTML = ''; }
	if (board[0][1]=='W')          { document.getElementById('board01').innerHTML = '<img src="pawnwhite.png">'; }
		else if (board[0][1]=='B') { document.getElementById('board01').innerHTML = '<img src="pawnblack.png">'; }
		else                       { document.getElementById('board01').innerHTML = ''; }
	if (board[0][2]=='W')          { document.getElementById('board02').innerHTML = '<img src="pawnwhite.png">'; }
		else if (board[0][2]=='B') { document.getElementById('board02').innerHTML = '<img src="pawnblack.png">'; }
		else                       { document.getElementById('board02').innerHTML = ''; }
	if (board[1][0]=='W')          { document.getElementById('board10').innerHTML = '<img src="pawnwhite.png">'; }
		else if (board[1][0]=='B') { document.getElementById('board10').innerHTML = '<img src="pawnblack.png">'; }
		else                       { document.getElementById('board10').innerHTML = ''; }
	if (board[1][1]=='W')          { document.getElementById('board11').innerHTML = '<img src="pawnwhite.png">'; }
		else if (board[1][1]=='B') { document.getElementById('board11').innerHTML = '<img src="pawnblack.png">'; }
		else                       { document.getElementById('board11').innerHTML = ''; }
	if (board[1][2]=='W')          { document.getElementById('board12').innerHTML = '<img src="pawnwhite.png">'; }
		else if (board[1][2]=='B') { document.getElementById('board12').innerHTML = '<img src="pawnblack.png">'; }
		else                       { document.getElementById('board12').innerHTML = ''; }
	if (board[2][0]=='W')          { document.getElementById('board20').innerHTML = '<img src="pawnwhite.png">'; }
		else if (board[2][0]=='B') { document.getElementById('board20').innerHTML = '<img src="pawnblack.png">'; }
		else                       { document.getElementById('board20').innerHTML = ''; }
	if (board[2][1]=='W')          { document.getElementById('board21').innerHTML = '<img src="pawnwhite.png">'; }
		else if (board[2][1]=='B') { document.getElementById('board21').innerHTML = '<img src="pawnblack.png">'; }
		else                       { document.getElementById('board21').innerHTML = ''; }
	if (board[2][2]=='W')          { document.getElementById('board22').innerHTML = '<img src="pawnwhite.png">'; }
		else if (board[2][2]=='B') { document.getElementById('board22').innerHTML = '<img src="pawnblack.png">'; }
		else                       { document.getElementById('board22').innerHTML = ''; }
}


function clear_selected() {
    document.getElementById('board00').style.backgroundColor = '#fff'; 
    document.getElementById('board01').style.backgroundColor = '#fff'; 
    document.getElementById('board02').style.backgroundColor = '#fff'; 
    document.getElementById('board10').style.backgroundColor = '#fff'; 
    document.getElementById('board11').style.backgroundColor = '#fff'; 
    document.getElementById('board12').style.backgroundColor = '#fff'; 
    document.getElementById('board20').style.backgroundColor = '#fff'; 
    document.getElementById('board21').style.backgroundColor = '#fff'; 
    document.getElementById('board22').style.backgroundColor = '#fff'; 
    click_state = 0; 
}

function new_game(game_type) {
	document.getElementById('hexaboard').style.borderColor = "white"; 
    game_over = false; 
    turn = 'W';
    board = [['B','B','B'],['','',''],['W','W','W']];
    board_states = [];
    clear_selected(); 
    update_board_div();    
    check_for_win();  
    if(game_type=='hvh') {game_mode=0}; // Human v. Human
    if(game_type=='hvm') {game_mode=1}; // Human v. Machine
    if(game_type=='mvm') {game_mode=2}; // Machine v. Machine!
	clear_fill(); // Refresh the game tree
    if(game_mode==2) { setTimeout( function(){machine_move()},500); } // Start game if mvm
}

function check_for_win() {
    /*  Update legal_moves and check for a win.
        A win occurs when (1) your piece reaches the other side,
                          (2) you capture all of your opponents pieces, or
                          (3) it is your opponent's turn and they have no legal move
    */
    legal_moves = [];
    if (game_over) { return ''; }

    if (board[0][0]=='W' || board[0][1]=='W' || board[0][2]=='W') { game_over=true; console.log('W wins'); return 'W'; }
    if (board[2][0]=='B' || board[2][1]=='B' || board[2][2]=='B') { game_over=true; console.log('B wins'); return 'B'; }

    if (board[0][0]!='B' && board[0][1]!='B' && board[0][2]!='B' &&
        board[1][0]!='B' && board[1][1]!='B' && board[1][2]!='B') { game_over=true; console.log('W wins'); return 'W'; }
    if (board[2][0]!='W' && board[2][1]!='W' && board[2][2]!='W' &&
        board[1][0]!='W' && board[1][1]!='W' && board[1][2]!='W') { game_over=true; console.log('B wins'); return 'B'; }
        
    if (turn=='W') {
        // At this point, W has to be on rows 1 or 2
        for (var r=1;r<3;r++) {
            for (var c=0;c<3;c++) {
                if (board[r][c]=='W') {
                    // Check for move forward
                    if (board[r-1][c]=='') {
                        legal_moves.push([[r,c],[r-1,c]]);
                    }
                    // Check for W takes B
                    if (c>0) {  // Take left
                        if (board[r-1][c-1]=='B') {
                            legal_moves.push([[r,c],[r-1,c-1]]);
                        }
                    }
                    if (c<2) { // Take right
                        if (board[r-1][c+1]=='B') {
                            legal_moves.push([[r,c],[r-1,c+1]]);
                        }
                    }
                }
            }        
        }
    } else { // turn=='B'
        // At this point, B has to be on rows 0 or 1
        for (var r=0;r<2;r++) {
            for (var c=0;c<3;c++) {
                if (board[r][c]=='B') {
                    // Check for move forward
                    if (board[r+1][c]=='') {
                        legal_moves.push([[r,c],[r+1,c]]); 
                    }
                    // Check for B takes B
                    if (c>0) {
                        if (board[r+1][c-1]=='W') {
                            legal_moves.push([[r,c],[r+1,c-1]]);
                        }
                    }
                    if (c<2) {
                        if (board[r+1][c+1]=='W') {
                            legal_moves.push([[r,c],[r+1,c+1]]);
                        }
                    }
                }
            }
        }
        
    }
    if (legal_moves.length < 1) {
    	game_over=true;
    	if (turn=='B') { console.log('W3 wins'); return 'W'; }
    	if (turn=='W') { console.log('B wins'); return 'B'; }
    }
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

function make_move( move ) { 
	console.log(move); 
	/* A move is an array of the form [[r0,c0],[r1,c1]], as seen in legal_moves	*/
	var r0 = move[0][0];
	var c0 = move[0][1];
	var r1 = move[1][0];
	var c1 = move[1][1];
	
	if (turn=='W') { board[r1][c1]='W'; }
    else { board[r1][c1]='B'; }
    
    board[r0][c0]=''; 
    	
	if (turn=='W') { turn = 'B'; }	
	else { turn = 'W'; }
	
	
	// Update board
    update_board_div();
    clear_selected(); 
    
    board_states.push( get_state_string() );    
    
    // Check for win 
    var winner = check_for_win();
    if (winner != '') {
    	document.getElementById('hexaboard').style.borderColor = "red"; 
    }
    if (winner == 'W') {
        update_tree(board_states,[1.0,0.0]); 
    } else if (winner == 'B') {
        update_tree(board_states,[0.0,1.0]); 
    } else if (legal_moves.length < 1) {
        update_tree(board_states,[0.5,0.5]); 
    } else {
        update_tree(board_states); 
    }
    
    if (!game_over && game_mode == 1 && turn=='B') {
		//machine_move();
		setTimeout( function(){machine_move(); },350);
    } else if (!game_over && game_mode==2) {
        //machine_move(); 
        setTimeout( function(){machine_move(); },350);
    }
    
    if (game_over && game_mode==2) {
	    setTimeout( function(){new_game(2)},1000);
	}
}

function make_move_from_state(node) {
	/* This function really belongs in game_tree.js */
	/* Given node, make the move in the game to reach that node from current_known_state */

	console.log('Moving from state'); 

	ns = node.state; 
	board = [[ns.charAt(0).replace('-',''),ns.charAt(1).replace('-',''),ns.charAt(2).replace('-','')],
			 [ns.charAt(4).replace('-',''),ns.charAt(5).replace('-',''),ns.charAt(6).replace('-','')],
			 [ns.charAt(8).replace('-',''),ns.charAt(9).replace('-',''),ns.charAt(10).replace('-','')]];
	
	if (turn=='W') { turn = 'B'; }	
	else { turn = 'W'; }
	
	
	// Update board
    update_board_div();
    clear_selected(); 
    
    board_states.push( node.state );    
    
    // Check for win 
    var winner = check_for_win();
    if (winner != '') {
    	document.getElementById('hexaboard').style.borderColor = "red"; 
    }
    if (winner == 'W') {
        update_tree(board_states,[1.0,0.0]); 
    } else if (winner == 'B') {
        update_tree(board_states,[0.0,1.0]); 
    } else if (legal_moves.length < 1) {
        update_tree(board_states,[0.5,0.5]); 
    } else {
        update_tree(board_states); 
    }
    
    if (!game_over && game_mode == 1 && turn=='B') {
		//machine_move();
		setTimeout( function(){machine_move(); },350);
    } else if (!game_over && game_mode==2) {
        //machine_move(); 
		setTimeout( function(){machine_move(); },350);
    }
    
    if (game_over && game_mode==2) {
	    setTimeout( function(){new_game(2)},1000);
	}
}

function machine_move() {

	if (game_mode == 0) { return false; }
	if (game_over) { return false; }
	if (legal_moves.length<1) { return false; } 
	
	// If there is only one move, then do it
	if (legal_moves.length==1) {
		make_move(legal_moves[0]); 
		return; 
	}
	
	// Look at tree to help decide next move
	var known_next_states = current_state_node.children; 
	var move = legal_moves[0]; 
	
	if (known_next_states==null || known_next_states.length<1) {
		/* Current state has never been seen before */
		// Pick a random move
		move = legal_moves[Math.floor(Math.random()*legal_moves.length)];
		//console.log('Moving');
		//console.log(move); 
	} else if (known_next_states.length == legal_moves.length) {
		/* Current state is fully enumerated */
		// Look at known moves.  White wants to max, black wants to min.
		var best_known_id = 0;
		var best_known_move = known_next_states[best_known_id]; 
		for (var move_id=1; move_id<known_next_states.length; move_id++) {
			if (turn=='W' && (known_next_states[move_id].playerwins[0]-known_next_states[move_id].playerwins[1])>(best_known_move.playerwins[0]-best_known_move.playerwins[1])) {
				best_known_id = move_id;
				best_known_move = known_next_states[best_known_id]; 
			} else if (turn=='B' && (known_next_states[move_id].playerwins[0]-known_next_states[move_id].playerwins[1])<(best_known_move.playerwins[0]-best_known_move.playerwins[1])) {
				best_known_id = move_id;
				best_known_move = known_next_states[best_known_id]; 
			}
		}
		setTimeout( function(){make_move_from_state(best_known_move); },350);
		return; 
	} else {
		/* Current state is partially enumerated */ 
		// Look at known moves.  White wants to max, black wants to min.
		var best_known_id = 0;
		var best_known_move = known_next_states[best_known_id]; 
		for (var move_id=1; move_id<known_next_states.length; move_id++) {
			if (turn=='W' && (known_next_states[move_id].playerwins[0]-known_next_states[move_id].playerwins[1])>(best_known_move.playerwins[0]-best_known_move.playerwins[1])) {
				best_known_id = move_id;
				best_known_move = known_next_states[best_known_id]; 
			} else if (turn=='B' && (known_next_states[move_id].playerwins[0]-known_next_states[move_id].playerwins[1])<(best_known_move.playerwins[0]-best_known_move.playerwins[1])) {
				best_known_id = move_id;
				best_known_move = known_next_states[best_known_id]; 
			}
		}
		
		// If best known move is acceptable, do it, otherwise pick from the unknown moves
		if (turn=='W' && best_known_move.playerwins[0]-best_known_move.playerwins[1]>0) {  // Hard-coded simple max (>0)
			setTimeout( function(){make_move_from_state(best_known_move); },350);
			return; 
		} else if (turn=='B' && best_known_move.playerwins[0]-best_known_move.playerwins[1]<0) {  // Hard-coded simple min
			setTimeout( function(){make_move_from_state(best_known_move); },350);
			return; 
		} else {
			move = legal_moves[Math.floor(Math.random()*legal_moves.length)]; // TODO: This doesn't guarantee improved exploration. We should remove the known moves first
		}
	}
	
	setTimeout( function(){make_move(move)},350);
}


function board_click(r,c) {
    if (game_over) { return false; }
    
    // User click state machine
    if (click_state==0) {
        // First click
        if (board[r][c]=='' || (turn=='W' && board[r][c]!='W') || (turn=='B' && board[r][c]!='B')) { return false; }
        document.getElementById('board'+r.toString()+c.toString()).style.backgroundColor='#FDD';
        click_state = 1;
        clicked_square = [r,c];
        return false; 
    } else if (click_state==1 && clicked_square[0]==r && clicked_square[1]==c) {
        // Clicked same piece.  Reset states.
        click_state = 0;
        document.getElementById('board'+r.toString()+c.toString()).style.backgroundColor='#FFF';
        return false; 
    } else if (click_state==1 && (clicked_square[0]!=r || clicked_square[1]!=c) && board[r][c]==turn) {
        // Different piece of same color clicked.  Switch pieces
        document.getElementById('board'+clicked_square[0].toString()+clicked_square[1].toString()).style.backgroundColor='#FFF';        
        document.getElementById('board'+r.toString()+c.toString()).style.backgroundColor='#FDD';
        clicked_square = [r,c]; 
        return false; 
    } else if (click_state==1) { 
    	// move forward, or take piece, if it is a legal move
    	var move_is_legal = false; 
    	for (var move_id=0;move_id<legal_moves.length;move_id++) {
    		if( legal_moves[move_id][0][0]==clicked_square[0] && 
    			legal_moves[move_id][0][1]==clicked_square[1] &&
    			legal_moves[move_id][1][0]==r &&
    			legal_moves[move_id][1][1]==c ) {
    			move_is_legal = true;
    			break;
    		}
    	}
    	if (!move_is_legal) { return false; }
    	// Execute move
    	make_move([clicked_square,[r,c]]);
    }
    
    
    
}
