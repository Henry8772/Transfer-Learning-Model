var dtwknn = new DtwKnn();
var fn_list = ["dataset-circle.json", "dataset-push.json", "dataset-s.json", "dataset-triangle.json"]
function collect(labelIndex) {
    $.getJSON(`motion/${fn_list[labelIndex]}`, function( data ) {
        for (var i = 0; i < 5; ++i)
            dtwknn.addSample(data[i], labelIndex)
        document.querySelector('#Examples').textContent =
        `5 examples collected for label: ${labelIndex}`;
    });
}

function train() {
    document.querySelector('#TrainState').textContent =
    `Trained`;
}

function predict() {
    labelIndex = Math.floor(Math.random() * 3)
    $.getJSON(`motion/${fn_list[labelIndex]}`, function( data ) {
        dataIndex = 5 + Math.floor(Math.random()) * 5;
        sample = data[dataIndex];
        pred = dtwknn.predict(sample);
        document.querySelector('#PredictState').textContent =
        `pred: ${pred[0]}, groundtruth:${labelIndex}`;
    });
}