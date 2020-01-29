/*
Jedediyah Williams
jedediyah.com
June, 2019
*/

class Network {
  /* Represents a fully connected artificial neural network with biases at each layer */ 
  constructor(structure) {
    /* structure is an array of the form [L_0, L_1, L_2, L_3, ..., L_n] 
          where L_i is the number of nodes in layer i.  L_0 is the 
          number of inputs and L_n is the number of outputs    
     */
    this.layers = structure.slice(0);   // Non-reference copy of structure
    this.layers[0] += 1;                // Make room for the bias
    this.nodes = [];                    // Node values in the network
    for (var layer=0; layer<this.layers.length; layer++) {
      this.nodes.push([]); 
      for (var node=0; node<this.layers[layer]; node++) {
        this.nodes[layer].push(0.0); 
      }
    } 
    this.weights = []; 
    this.activation_function = this.relu; 
    this.randomize_weights(); 
  }
  
  /* Activation functions */
  relu(x) {
    return Math.max(0.0,x);
  }
  sigmoid(x) {
    return 1.0/(1.0+Math.exp(-x));
  }
  softmax(X) {
    // Input is an array of outputs
    var total = 0.0; 
    for (var i=0;i<X.length;i++) {
      X[i] = Math.exp(X[i]);
      total += X[i];
    }
    for (var i=0;i<X.length;i++) {
      X[i] /= total; 
    }
    return X; 
  }
  
  /* Class functions */  
  randomize_weights() {
    /* Generate random weights */
    for (var layer=0; layer<this.layers.length-1; layer++) {
      this.weights.push([]); 
      for (var node=0; node<this.layers[layer+1]; node++) {
        this.weights[layer][node] = [];
        for (var weight=0; weight<this.layers[layer]; weight++) {
          this.weights[layer][node].push(Math.random());
        }
      }
    }
  }
  
  forward_propogate(inputs) {
    this.nodes[0] = inputs.slice(0);    // Load the inputs into the network
    this.nodes[0].unshift(1.0);         // Include a bias
    for (var layer=1; layer<this.layers.length; layer++) {
      console.log('Layer: ' + layer); 
      for (var node=0; node<this.layers[layer]; node++) {
        console.log('Node: ' + node); 
        this.nodes[layer][node] = 0.0; 
        for (var weight=0; weight<this.weights[layer-1][node].length; weight++) {
          console.log('Weight: ' + weight); 
          console.log(this.weights[layer-1][node][weight]);
          this.nodes[layer][node] += this.weights[layer-1][node][weight]*this.nodes[layer-1][weight]; 
        }
        this.nodes[layer][node] = this.activation_function(this.nodes[layer][node]);  // Apply activation function
      }
    }
    this.softmax(this.nodes[this.layers.length-1]);   // Apply softmax to output
    return this.nodes[this.layers.length-1];          // Return the output layer of the network
  }
}

var net = new Network([6,5,5,3]); 
var inputs = [1.0,2.0,3.0,4.0,5.0,6.0];
console.log(net.forward_propogate(inputs));























