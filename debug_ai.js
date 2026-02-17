
const { generateFromPrompt } = require('./src/engine/aiSchematicEngine');
const { computeNets } = require('./src/engine/connectivity');

const prompt = "Generate Test Z Nightmare system";
const { symbols, wires } = generateFromPrompt(prompt);

console.log('SYMBOLS:', symbols.length);
console.log('WIRES:', wires.length);

const nets = computeNets(symbols, wires);
console.log('NETS:', nets.length);
nets.forEach(n => console.log(`Net: ${n.id} (name: ${n.name})`));
