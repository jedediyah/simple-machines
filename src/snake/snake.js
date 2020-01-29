

class Game{
  constructor(canvas_id) {
    this.width = 15;
    this.height = 15; 
    this.snake = new Snake(); 
    this.fitness = 0.0; 
    this.food_placed = false; 
    this.canvas_id = canvas_id; 
    this.do_draw = true; 
    this.food_location = [-1,-1]; 
    this.steps_since_food_eaten = 0; 
    this.keep_running = true; 
    this.wait_time = 10;  // milliseconds 
    this.draw(); 
    
    this.sensor_forward = [0];
    this.sensor_left = [0];
    this.sensor_right = [0];
    this.sensor_food_distance_forward = [0]; 
    this.sensor_food_distnace_backward = [0]; 
    this.sensor_food_distance_left_right = [0];  // horizontal distance, -/+ is left/right
    
    this.sensor_food_distance_left = [0]; 
    this.sensor_food_distance_right = [0]; 
    
    
    // Network
    this.inputs = [ [1.0],
                    this.sensor_forward,
                    this.sensor_left,
                    this.sensor_right,
                    this.sensor_food_distance_forward,
                    this.sensor_food_distance_left,
                    this.sensor_food_distance_right ]; 
                                        
    //this.layers = [7,7,5,3];  // this.layers[0] is the size of the input layer (# of sensors plus one)
    this.layers = [7,7,3];
    //this.layers = [7,3];
    this.weights = [];
    //this.activation = this.sigmoid;
    this.activation = this.relu; 
    this.init_network(); 
  }
  keypress(e) {
    // In order for this function to function, we need to use the following in snake.html:
    //   window.onkeyup = function(e) {
    //     game.keypress(e); 
    //   }
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 38)      { this.snake.velocity = [0,-1]; }
    else if (key == 40) { this.snake.velocity = [0,1];  }
    else if (key == 37) { this.snake.velocity = [-1,0]; }
    else if (key == 39) { this.snake.velocity = [1,0];  }
  }
  is_empty(x,y) {
    // Returns true if there is no body at [x,y], food is allowed
    if (x<0 || x>=this.width || y<0 || y>=this.height) {
      return false; 
    }
    for (var i=0; i<this.snake.body.length; i++) {
      if (this.snake.body[i][0]==x && this.snake.body[i][1]==y) {
        return false;
      }
    }
    return true; 
  }
  update_sensors() {
    this.sensor_forward[0] = 0; 
    this.sensor_left[0] = 0;
    this.sensor_right[0] = 0;
    
    var forward = this.snake.velocity; 
    var left = [this.snake.velocity[1],-this.snake.velocity[0]];
    var right = [-this.snake.velocity[1],this.snake.velocity[0]];
    
    // Forward 
    var next_block = [this.snake.body[0][0]+forward[0], this.snake.body[0][1]+forward[1]];
    while (this.is_empty(next_block[0],next_block[1])) {
      this.sensor_forward[0] += 1; next_block[0] += forward[0]; next_block[1] += forward[1];
    }
    // Left
    next_block = [this.snake.body[0][0]+left[0], this.snake.body[0][1]+left[1]];
    while (this.is_empty(next_block[0],next_block[1])) {
      this.sensor_left[0] += 1;  next_block[0] += left[0]; next_block[1] += left[1];
    }
    // Right
    next_block = [this.snake.body[0][0]+right[0], this.snake.body[0][1]+right[1]];
    while (this.is_empty(next_block[0],next_block[1])) {
      this.sensor_right[0] += 1; next_block[0] += right[0]; next_block[1] += right[1];
    }
    
    // Food sensors
    if (this.snake.velocity[0]==0) {
      if (this.snake.velocity[1]==-1) {         // up
        this.sensor_food_distance_forward[0] = this.snake.body[0][1] - this.food_location[1];
        this.sensor_food_distance_left_right[0] = this.food_location[0] - this.snake.body[0][0]; 
      } else if (this.snake.velocity[1]==1) {   // down
        this.sensor_food_distance_forward[0] = this.food_location[1] - this.snake.body[0][1]; 
        this.sensor_food_distance_left_right[0] = this.snake.body[0][0] - this.food_location[0];
      }
    } else if (this.snake.velocity[1]==0) {
      if (this.snake.velocity[0]==-1) {         // left 
        this.sensor_food_distance_forward[0] = this.snake.body[0][0] - this.food_location[0];
        this.sensor_food_distance_left_right[0] = this.snake.body[0][1] - this.food_location[1]; 
      } else if (this.snake.velocity[0]==1) {   // right
        this.sensor_food_distance_forward[0] = this.food_location[0] - this.snake.body[0][0]; 
        this.sensor_food_distance_left_right[0] = this.food_location[1] - this.snake.body[0][1]; 
      }
    }
    
    if (this.sensor_food_distance_left_right[0] < 0.0) {
      this.sensor_food_distance_left[0] = -this.sensor_food_distance_left_right[0];
      this.sensor_food_distance_right[0] = 0.0; 
    } else {
      this.sensor_food_distance_right[0] = this.sensor_food_distance_left_right[0];
      this.sensor_food_distance_left[0] = 0.0; 
    }
    if (this.sensor_food_distance_forward[0] < 0.0) {
      this.sensor_food_distance_forward[0] = 0.0; 
    }
    
    //console.log("Forward: " + this.sensor_forward); 
    //console.log("Left: " + this.sensor_left); 
    //console.log("Right: " + this.sensor_right); 
    //console.log(this.sensor_food_distance_forward);
    //console.log(this.sensor_food_distance_left_right);
  }
  // Activation functions
  relu(x) {
    return Math.max(0.0,x); 
  }
  sigmoid(x) {
    return 1.0/(1.0+Math.exp(-x));
  }
  init_network() {
    // This network is used to make a decision (move_decision()) about turning left, right, or straight.
    // The first layer inputs are "sensor" readings of this.sensors
    // Generate weights
    for (var l=1; l<this.layers.length; l++) {           // for each layer
      this.weights.push([]); 
      for (var n=0; n<this.layers[l]; n++) {             // for each node 
        var new_weights = []; 
        for (var w=0; w<this.layers[l-1]; w++) {  // for each node in the previous layer
          new_weights.push(Math.random());          
        }
        this.weights[l-1].push(new_weights);
      }
    }
  }
  move_decision() {  // a.k.a. forward propogation 
    // Given the current state of sensors, make a decision to move left, straight, or right
    // Updates this.snake.velocity 
    this.update_sensors();
    //console.log('--------'); 
    var previous_layer = [];
    for (var i=0; i<this.inputs.length; i++) {
      previous_layer.push(this.inputs[i][0]); 
    }
    var max_input = Math.max(...previous_layer);
    for (var i=0; i<previous_layer.length; i++) {
      previous_layer[i] /= max_input; 
    }
    //console.log(previous_layer); 
    for (var l=1; l<this.layers.length; l++) {  // for each layer
      var next_layer = [];
      for (var n=0; n<this.layers[l]; n++) {  // for each node
        var node_sum = 0.0; 
        for (var w=0; w<this.layers[l-1]; w++) {  // for each node in the previous layer
          node_sum += previous_layer[w]*this.weights[l-1][n][w];
        }
        next_layer.push( this.activation(node_sum) ); 
      }
      previous_layer = next_layer;
      //console.log(previous_layer);  
    }
    //console.log(previous_layer)
    // Decision 
    if (previous_layer[0]>previous_layer[1] && previous_layer[0]>previous_layer[2]) {  // Turn left
      this.snake.velocity = [this.snake.velocity[1],-this.snake.velocity[0]];
    } else if (previous_layer[2]>previous_layer[0] && previous_layer[2]>previous_layer[1]) {  // Turn right
      this.snake.velocity = [-this.snake.velocity[1],this.snake.velocity[0]];
    } else {
      // Go straight
    }
    
  }
  stop() {
    this.keep_running = false; 
  }
  step() {
    if (!this.food_placed) {
      // Assumes a small snake!
      while(!this.food_placed) {
        this.food_placed = true;
        this.food_location = [Math.floor(Math.random()*(this.width-1)),Math.floor(Math.random()*(this.height-1))];
        for (var i=0; i<this.snake.length; i++) {
          if (this.snake.body[i][0]==this.food_location[0] && this.snake.body[i][1]==this.food_location[1]) {
            this.food_placed = false; 
            break; 
          }
        }
      }
    }
    if (this.keep_running) {
      this.move_decision(); 
      this.snake.move();
      if (this.snake.body[0][0]==this.food_location[0] && this.snake.body[0][1]==this.food_location[1]) {
        this.snake.extend = true; 
        this.food_location = [-1,-1];
        this.food_placed = false; 
        this.steps_since_food_eaten = 0; 
      } else {
        this.steps_since_food_eaten += 1;
        if (this.steps_since_food_eaten > 200) {  // Hard-coded limit on steps without food (starvation heuristic)
          this.keep_running = false; 
        }
      }
      this.fitness += 1.0/Math.pow(2.0,this.steps_since_food_eaten);
      //console.log(this.fitness); 
    }
    this.collide(); 
    this.draw(this.canvas_id); 
  }
  draw() {
    if (!this.do_draw || this.canvas_id === '') {
      return;
    }
    var c = document.getElementById(this.canvas_id); 
    var ctx = c.getContext("2d"); 
    
    var canvas_width = c.width;
    var canvas_height = c.height; 
    
    if (!this.keep_running) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#ffcccc";
    } else {
      ctx.fillStyle = "#888888";
    }
    ctx.fillRect(0,0,canvas_width,canvas_height);
    ctx.stroke();
    
    var body_width = Math.round(canvas_width / (this.width+1));
    var body_height = Math.round(canvas_height / (this.height+1));
    
    ctx.fillStyle = "#000000";
    ctx.globalAlpha = 1.0;
    for (var i=0; i<this.snake.body.length; i++) {    
      var sx = Math.round(this.snake.body[i][0]*(body_width+1));
      var sy = Math.round(this.snake.body[i][1]*(body_width+1));
      ctx.globalAlpha = 1.0 - (i*1.0)/(2*this.snake.body.length);
      ctx.fillRect(sx,sy,body_width,body_height);
      ctx.stroke();
    }    
    ctx.globalAlpha = 1.0; 
    
    if (this.food_placed) {
      ctx.fillStyle = "#ccffcc";
      var fx = Math.round(this.food_location[0]*(body_width+1));
      var fy = Math.round(this.food_location[1]*(body_width+1)); 
      ctx.fillRect(fx,fy,body_width,body_height);
      ctx.stroke();
    }
  }
  collide() {
    if ( this.snake.body[0][0] < 0 || 
         this.snake.body[0][0] >= this.width ||
         this.snake.body[0][1] < 0 || 
         this.snake.body[0][1] >= this.height ) {
      this.keep_running = false; 
      return true;
    } 
    for (var i=1; i<this.snake.body.length; i++) {
      if (this.snake.body[0][0]==this.snake.body[i][0] && this.snake.body[0][1]==this.snake.body[i][1]) {
        this.keep_running = false; 
        return true;
      }
    }
    return false; 
  }
  run() {
    this.step(); 
    if (this.keep_running) {
      setTimeout(this.run.bind(this), this.wait_time);  // Time between steps
    }
  }
}

class Snake {
  constructor() {
    this.body = [[5,10],[5,11],[5,12]];
    this.velocity = [0,-1];  // up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]
    this.extend = false; 
  }
  move() {
    if (this.extend) {
      var last_block_x = this.body[this.body.length-1][0];
      var last_block_y = this.body[this.body.length-1][1];
    }
    for (var i=this.body.length-1; i>0; i--) {
      this.body[i][0] = this.body[i-1][0];
      this.body[i][1] = this.body[i-1][1];
    }
    this.body[0][0] += this.velocity[0];
    this.body[0][1] += this.velocity[1]; 
    if (this.extend) {
      this.body.push([last_block_x,last_block_y]);
      this.extend = false; 
    }
  }
}
