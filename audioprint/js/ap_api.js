const NUM_FRAMES = 3;
/*
 * This class is for audio print transfer learning.
 */
class AudioPrintNet
{
    constructor(numOfClass) {
        this.numOfClass = numOfClass;
        this.inputShape = [NUM_FRAMES, 232, 1];
        this.model = null;
        this.frameSize = 232;
        this.examples = [];
    };

    clearTrainData() {
        this.examples = [];
    }

    flatten(tensors) {
        const size = tensors[0].length;
        const result = new Float32Array(tensors.length * size);
        tensors.forEach((arr, i) => result.set(arr, i * size));
        return result;
    }

    normalize(x) {
        const mean = -100;
        const std = 10;
        return x.map(x => (x - mean) / std);
    }

    addExample(data, label) {
        let vals = this.normalize(data.subarray(-this.frameSize * NUM_FRAMES));
        this.examples.push({vals, label});
    }

    async train(resultShownCallback) {
        if (this.examples.length == 0) {
            console.log("Please add train data at first!")
            return;
        }
        const ys = tf.oneHot(this.examples.map(e => e.label), this.numOfClass);
        const xsShape = [this.examples.length, ...this.inputShape];
        const xs = tf.tensor(this.flatten(this.examples.map(e => e.vals)), xsShape);

        const optimizer = tf.train.adam(0.01);
        this.model.compile({
          optimizer,
          loss: 'categoricalCrossentropy',
          metrics: ['accuracy']
        });
       
        await this.model.fit(xs, ys, {
          batchSize: 16,
          epochs: 10,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
                resultShownCallback(`Accuracy: ${(logs.acc * 100).toFixed(1)}% Epoch: ${epoch + 1}`)
            }
          }
        });
        tf.dispose([xs, ys]);
    }

    async predict(data, resultPredictCallback) {
        const vals = this.normalize(data.subarray(-this.frameSize * NUM_FRAMES));
        const input = tf.tensor(vals, [1, ...this.inputShape]);
        const probs = this.model.predict(input);
        const predLabel = probs.argMax(1);
        await resultPredictCallback(predLabel);
        tf.dispose([input, probs, predLabel]);
    }

    async buildModel() {
        this.recognizer = speechCommands.create('BROWSER_FFT');
        await this.recognizer.ensureModelLoaded();
        this.model = tf.sequential();
        this.model.add(tf.layers.depthwiseConv2d({
          depthMultiplier: 8,
          kernelSize: [NUM_FRAMES, 3],
          activation: 'relu',
          inputShape: this.inputShape
        }));
        this.model.add(tf.layers.maxPooling2d({poolSize: [1, 2], strides: [2, 2]}));
        this.model.add(tf.layers.flatten());
        this.model.add(tf.layers.dense({units: 3, activation: 'softmax'}));
    }

    saveModel(server, token, onsaved=null) {
        var memo = [];
        this.examples.forEach((o)=>{
            memo.push({'label':o.label,'vals':F32Stringify(o.vals)})
        })
        SaveData(server, 'AudioPrint', token, JSON.stringify(memo), onsaved);
    }

    async loadModel(server, token, onload) {
        LoadData(server, 'AudioPrint', token, async (data)=>{
            var memo = JSON.parse(data);
            this.examples = []
            memo.forEach((o)=>{
                this.examples.push({'label': o.label, 'vals': F32Parse(o.vals)})
            });
            await this.train(onload);
        });
    }
}
