/*
Jedediyah Williams
jedediyah.com
December, 2019
*/


// Much of the code for the d3 tree below was modified from:
// https://bl.ocks.org/d3noob/8375092


root = null;  // The root node in the tree 

current_state_node = null; // 

/*
    Nodes have the following useful attributes:
        d.circlesize    - int, The radius of the node
        d.highlight     - boolean, if true the node will be bigger and red 
        d.state         - The string representing the game state for that node
        d.playerwins    - A float array storing the win history for each player (we assume two players below)
*/


// ************** Generate the tree diagram	 *****************
var margin = {top: 0, right: 20, bottom: 20, left: 20},
	width = 1100 - margin.right - margin.left,
	height = 800 - margin.top - margin.bottom;
	
var i = 0,
	duration = 750,
	root;

var tree = d3.layout.tree()
	.size([height, width]);

var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
  .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.select(self.frameElement).style("height", "800px");

var smallradius = 1;
var bigradius = 7;

function make_root(name_of_root_node) {
	var treeData = [{"name":name_of_root_node,'state':name_of_root_node,'playerwins':[0.0,0.0],'highlight':true}];
	root = treeData[0];
	root.x0 = height / 2;
	root.y0 = 0;
	update(root); 
}

function get_node(move_sequence) {
	// Get the node represented by the last move in move_sequence.  This is particularly useful
	// for looking at stored variables like node.player1_wins or node.player2_wins.	
}

function get_possible_moves() {
    // Given the current_state_node, returns an array of tuples containing
    // All known next states along with a heuristic of player1_wins - player2_wins (essentially minimax)

    if (current_state_node==null) { return []; }
    if (current_state_node.children==null) { return []; }
    if (current_state_node.children.length<1) { return []; }

    var possible_moves = [];
    for (var child_id=0; child_id<current_state_node.children.length; child_id++) {
        possible_moves.push( [current_state_node.children[child_id].state, 
                              current_state_node.children[child_id].playerwins[0] - current_state_node.children[child_id].playerwins[1] ] );
    }

    return possible_moves; 
}

function update_tree(move_sequence,points=[0.0,0.0]) {
	// Assumes the first move in move_sequence does not include the root node
    // points is added to the tree node to keep track of player-1 points and player-2 points. [0.5,0.5] is a draw.
	var current_node = root; 	
    current_node.playerwins[0] += points[0];
    current_node.playerwins[1] += points[1];
	for (var move_id=0; move_id<move_sequence.length; move_id++) {
		var state = move_sequence[move_id]; 
		if (current_node.children == null) {
			//console.log('New Child'); 
			current_node.children = [{'name':state,'state':state,'highlight':true,'circlesize':bigradius,'playerwins':points}];
			update(root);
			current_node = current_node.children[current_node.children.length-1];
		} else {
			var child_found = false; 
			for (var child_id=0; child_id<current_node.children.length; child_id++) {
				if (current_node.children[child_id].state==state) {
					current_node = current_node.children[child_id]; 
					current_node.highlight = true;
					current_node.circlesize=bigradius;
                    current_node.playerwins[0] += points[0];
                    current_node.playerwins[1] += points[1];
					update(root); 
					child_found = true;
					break; 
				}
			}
			if (!child_found) {
				current_node.children.push({'name':state,'state':state,'highlight':true,'circlesize':bigradius,'playerwins':points});
				update(root);
				current_node = current_node.children[current_node.children.length-1];
			}
		}
	}
	current_state_node = current_node; 
}

function clear_fill() {
	var nodes = tree.nodes(root);
	nodes.forEach(function(d) {d.highlight=false});
	nodes.forEach(function(d) {d.circlesize=smallradius});
	root.highlight=true;
	root.circlesize=bigradius;
	current_state_node = root; 
	update(root); 
}

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 120; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });

  nodeEnter.append("circle")
	  .attr("r", 1e-6)
	  .style("fill", function(d) { 
	  	if (d.parent==null) { return 'lightsteelblue'; }
	  	if (d.parent.highlight) { return 'lightsteelblue'; }
	  	if (d.children==null) { return '#fff'; }
	  	return '#ddd';   
	  });

  nodeEnter.append("text")
	  .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { return d.name; })
	  .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
	  .duration(duration)
	  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
	  .attr("r", function(d){  
	  	if (d.circlesize==null) { return smallradius; }
	  	return d.circlesize; 
	  })
	  .style("fill", function(d) { 
	  	if (d.highlight) { return '#f00'; }
	  	return "#fff"; 
	  });

  nodeUpdate.select("text")
	  .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
	  .duration(duration)
	  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
	  .remove();

  nodeExit.select("circle")
	  .attr("r", 1e-6);

  nodeExit.select("text")
	  .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", function(d) {
		var o = {x: source.x0, y: source.y0};
		return diagonal({source: o, target: o});
	  });

  // Transition links to their new position.
  link.transition()
	  .duration(duration)
	  .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
	  .duration(duration)
	  .attr("d", function(d) {
		var o = {x: source.x, y: source.y};
		return diagonal({source: o, target: o});
	  })
	  .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
	d.x0 = d.x;
	d.y0 = d.y;
  });
}



















