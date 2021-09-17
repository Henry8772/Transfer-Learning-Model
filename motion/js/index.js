var sample_data = [];
var dtwknn = new DtwKnn();

window.onload = function () {
    $('#info').html('DeviceMotionData');
}


function toggleDeviceMotion (labelIndex) {
    if (window.isTrackingDeviceMotion) {
        // Stop
        delete window.isTrackingDeviceMotion;
        if (sample_data.length > 30) {
            dtwknn.addSample(sample_data, labelIndex);
            document.querySelector('#Examples').textContent =
                 `${dtwknn.getSampleNum(labelIndex)} examples collected for label: ${labelIndex}`;
        }
        window.removeEventListener('devicemotion', onDeviceMotion);
        $(`#example${labelIndex}`).html(`Example${labelIndex}`);
    } else {
        // Start
        sample_data = [];
        window.isTrackingDeviceMotion = true
        $(`#example${labelIndex}`).html('Stop')
        if (window.DeviceOrientationEvent) {
            if (DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission()
            window.addEventListener('devicemotion', onDeviceMotion)
        } else {
            $('#info').html('DeviceOrientationEvent is not supported on this browser')
        }
    }
}

function clearExamples() {
    dtwknn.clearSamples();
    $('#Examples').html('No example');
}

function loadModel() {
    //'u00001' is user token, it might be any string.
    dtwknn.loadModel(`${window.location.protocol}//${window.location.host}`, "u00001", ()=>{
        $('#Examples').html(`${dtwknn.getSampleNum()} examples is loaded!`)
    });    
}

function saveModel() {
    //'u00001' is user token, it might be any string.
    dtwknn.saveModel(`${window.location.protocol}//${window.location.host}`, "u00001");    
}


function onDeviceMotion (e) {
    // console.clear()
    // console.log(e)
    sample_data.push({
        acceleration: e.acceleration,
        accelerationIncludingGravity: e.accelerationIncludingGravity,
        rotationRate: e.rotationRate
    })
    $('#info').html(
        '<p>acceleration ' + JSON.stringify(e.acceleration, null,'<br> ') + '</p>'
        + '<p>accelerationIncludingGravity<br>' + JSON.stringify(e.accelerationIncludingGravity, null,'<br> ') + '</p>'
        + '<p>rotationRate<br>' + JSON.stringify(e.rotationRate, null,'<br> ') + '</p>'
    )
}


function train() {
    $('#TrainState').html('Trained');
}

function predict() {
    if (window.isTrackingDeviceMotion) {
        // Stop
        delete window.isTrackingDeviceMotion;
        if (sample_data.length > 30) {
            pred = dtwknn.predict(sample_data);
            $('#PredictState').html(`predict: ${pred[0]}`);
            $('#Possibility').html(JSON.stringify(pred[1], null,'<br> '));
        }
        window.removeEventListener('devicemotion', onDeviceMotion);
        $('#predict').html('Predict');
    } else {
        // Start
        sample_data = [];
        window.isTrackingDeviceMotion = true
        $('#predict').html('Stop')
        if (window.DeviceOrientationEvent) {
            if (DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission()
            window.addEventListener('devicemotion', onDeviceMotion)
        } else {
            $('#info').html('DeviceOrientationEvent is not supported on this browser')
        }
    }

}

function app() {
}

app();