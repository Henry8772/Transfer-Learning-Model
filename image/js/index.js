let net;

const webcamElement = document.getElementById('webcam');
var tftn = new TransferNet();

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true},
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata',  () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

function saveModel() {
  tftn.saveModel(`${window.location.protocol}//${window.location.host}`, "u00001");
}

function loadModel() {
  tftn.loadModel(`${window.location.protocol}//${window.location.host}`, "u00001");
}


async function app() {
  console.log('Loading mobilenet..');
  await tftn.initialize();
  await setupWebcam();

  document.getElementById('class-a').addEventListener('click', () => tftn.addSample(webcamElement, 0));
  document.getElementById('class-b').addEventListener('click', () => tftn.addSample(webcamElement, 1));
  document.getElementById('class-c').addEventListener('click', () => tftn.addSample(webcamElement, 2));

  while (true) {
    if (tftn.classifier.getNumClasses() > 0) {
      const result = await tftn.predictClass(webcamElement);
      const classes = ['A', 'B', 'C'];
      document.getElementById('console').innerText = `
        prediction: ${classes[result.classIndex]}\n
        probability: ${result.confidences[result.classIndex]}
      `;
    }

    await tf.nextFrame();
  }
}

app();