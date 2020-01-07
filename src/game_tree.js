/*
Jedediyah Williams
jedediyah.com
December, 2019
*/

class Node{
    /* Represents a single state in the Tree class */
    constructor(parent_node, state_string) {
        this.parent = parent_node;
        this.state = state_string; 
        this.children = []; 
        this.player_wins = [0.0,0.0];  // Assumes two-player game
       
        this.div = document.createElement('div');
        this.div.className = 'tree-node';
        this.text = document.createElement('span'); 
        this.text.innerHTML = '"'+state_string+'"';
        this.div.appendChild(this.text); 
        if(this.parent!=null) {
            this.parent.div.appendChild(this.div);
        }
    }
    add_child(child_node) {
        this.children.push(child_node); 
    }
    get_state() {
    	return this.state; 
    }
    get_children() {
    	return this.children; 
    }
}
  
class GameTree {
    /*
        An expandable tree that can represent a boardgame structure which can be represnted by
        a string (or 1-d array).  The root node is the board's initial state and the first set
        of child nodes represents the first move.  This is *not* intended to be an efficient 
        tree datastrucutre, rather one that can demonstrate the basics of machine learning in
        an instructive way.  
        The GameTree itself has no sense of the game rules or architecture.  It is really an
        organizational structure, a database for storing information about abstract game-states.  
        Optimizations such as those related to removing redundencies of symmetry need to be
        handled at the game level.  
    */
    constructor(initial_board_string, draw_tree=true) {
        /* 
           initial_board_string is a string representing the initial board state.  Note that each 
               character represents a single "square," e.g., Hexapawn could be represented by
               initial_board_string = "BBB   WWW"
           possible_states is an array containing each state that each bucket could have (other than empty)
         */
        //this.initial_board_string = initial_board_string; 
        this.root_node = new Node(null, initial_board_string);
        this.root_node.div.style.padding='10px';
        if (draw_tree) {
            document.write('<div class="game-tree" id="game_tree"></div>');
            var tree_div = document.getElementById('game_tree'); 
            this.tree_div = tree_div; 
            this.tree_div.appendChild(this.root_node.div);
        }
    }
    
    print_children(node) {
        console.log(node.state);
        for (var i=0;i<node.children.length;i++){
            this.print_children(node.children[i]);
        }
    }
    print() {
        this.print_children(this.root_node); 
    }
    
    store_game(game_string_array, player_points) {
        /*  Add or update the sequence of game-states in game_string_array.  
            player_points=[0,1] corresponds to player2 winning a two player game.
            player_points=[0.5,0.5] could be the points awarded for a draw.
            player_points=[0,0] does not update a recorded winner, but the game_states will be stored. 
         */
        var current_node = this.root_node; 
  		current_node.player_wins[0] += player_points[0];
  		current_node.player_wins[1] += player_points[1];
      	for (var move_id=0; move_id<game_string_array.length; move_id++) {
      		var position = game_string_array[move_id]; 
      		var children = current_node.get_children();
      		var child_identified = false; 
      		for (var child_id=0; child_id<children.length; child_id++) {
      			if (children[child_id].get_state()==position) {
      				current_node = children[child_id]; 
			  		current_node.player_wins[0] += player_points[0];
			  		current_node.player_wins[1] += player_points[1];
      				child_identified = true;
      				break;
      			}
      		}
  			if (!child_identified) {   
  				console.log('Adding new game state');
  				console.log('"'+position+'"');
  				var new_node = new Node(current_node, position);
  				current_node.add_child(new_node);
  				current_node = new_node; 
		  		current_node.player_wins[0] += player_points[0];
		  		current_node.player_wins[1] += player_points[1];
  			}
      	}
      	this.highlight_sequence(game_string_array, '#DFD');
    }
    
    get_game_children(game_string_array) {
        /*  Given a sequence of game-states in game_string_array, returns any available child nodes
         */
      	var current_node = this.root_node; 
      	for (var i=0; i<game_string_array.length;i++) {
      		game_string = game_string_array[i]; 
      		var children = current_node.get_children();       		
      		if (children==null) {
      			console.log('Game not found');
      			return [0,0];  // Assumes a two-player game.
      		}       	
      		// ...	
      	}
    }
    
    get_child_strings(game_string_array) {
        /* Given a sequence of game-states in game_string_array, return an array of 
           all known next states */
        
    }
    
    highlight_sequence(game_string_array, background_color) {
        /* Given a sequence of game-states, highlight the divs containing those moves, if they exist. */
        var current_node = this.root_node; 
        current_node.text.style.background = background_color; 
        for (var i=0; i<game_string_array.length; i++) {
            var next_state = game_string_array[i];
            var state_children = current_node.get_children(); 
            for (var c=0; c<state_children.length; c++) {
                if (next_state == state_children[c].state) {
                    current_node = state_children[c];
                    current_node.text.style.background = background_color; 
                    break;
                }
            }
        }
    }
}























