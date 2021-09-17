var apn = new AudioPrintNet(3);

function collect(label) {
    if (apn.recognizer.isListening()) {
      return apn.recognizer.stopListening();
    }
    if (label == null) {
      return;
    }
  
    apn.recognizer.listen(async ({spectrogram: {frameSize, data}}) => {
      apn.addExample(data, label);
      document.querySelector('#Examples').textContent =
      `${apn.examples.length} examples collected`;
    }, {
      overlapFactor: 0.999,
      includeSpectrogram: true,
      invokeCallbackOnNoiseAndUnknown: true
    });
}

function toggleButtons(enable) {
  document.querySelectorAll('button').forEach(b => b.disabled = !enable);
}

// async function moveSlider(labelTensor) {
//   const label = (await labelTensor.data())[0];
//   document.getElementById('ListenState').textContent = label;
//   if (label == 2) {
//     return;
//   }
//   let delta = 0.1;
//   const prevValue = +document.getElementById('output').value;
//   document.getElementById('output').value =
//       prevValue + (label === 0 ? -delta : delta);
// }

const SAMPLE_TOTAL = 50;
var stats = {};
let predicts = [];
let labels = {0:"Example0", 1:"Example1", 2:"Example2"};

async function statistics(predLabel) {
  var index = (await predLabel.data())[0];
  if (predicts.length < SAMPLE_TOTAL) {
    predicts.push(index);
    stats[index] += 1;
  }
  else {
    old_index = predicts.shift();
    stats[old_index] -= 1;
    predicts.push(index);
    stats[index] += 1;
    index = Object.keys(stats).reduce(function(a, b){ return stats[a] > stats[b] ? a : b });
    var confi = ''
    Object.keys(stats).forEach((key)=>{
      confi += ` ${key}: ${(stats[key] * 1.0 / SAMPLE_TOTAL).toFixed(3)}`
    });
    document.getElementById('ListenState').textContent = labels[index] + `, ${confi}`;
  }
}

async function train() {
  toggleButtons(false);
  apn.train((status)=>{
    document.querySelector('#TrainState').textContent = status;
  });
  toggleButtons(true);
}
 
function listen() {
  if (apn.recognizer.isListening()) {
    apn.recognizer.stopListening();
    toggleButtons(true);
    document.getElementById('listen').textContent = 'Listen';
    return;
  }
  toggleButtons(false);
  document.getElementById('listen').textContent = 'Stop';
  document.getElementById('listen').disabled = false;
  stats = {0: 0, 1: 0, 2: 0};
  apn.recognizer.listen(async ({spectrogram: {frameSize, data}}) => {
    apn.predict(data, statistics);
  }, {
    overlapFactor: 0.999,
    includeSpectrogram: true,
    invokeCallbackOnNoiseAndUnknown: true
  });
}

async function saveModel() {
  apn.saveModel(`${window.location.protocol}//${window.location.host}`, "u00001", ()=>{
    $('#SavingState').html("model is saved.");
  });
}

async function loadModel() {
  apn.loadModel(`${window.location.protocol}//${window.location.host}`, "u00001", (status)=>{
    $('#TrainState').html(status);
  });
}

function clearTrainData() {
  apn.clearTrainData();
  document.getElementById('Examples').textContent = "No example";
}

async function app() {
  apn.buildModel();
}
  
app();