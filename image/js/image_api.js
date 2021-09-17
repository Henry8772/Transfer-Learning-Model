
/**
 * The API for one-shot image classification
 */
class TransferNet 
{
    constructor() {
        this.memo = {};
    };

    async initialize() {
        this.classifier = knnClassifier.create();
        this.featureExtractor = await mobilenet.load();
    }

    addSample(img, classId) {
        var activation = this.featureExtractor.infer(img, 'conv_preds');
        this.classifier.addExample(activation, classId);
        var arr = JSON.stringify(activation.arraySync())
        if (classId in this.memo)
            this.memo[classId].push(arr);
        else
            this.memo[classId] = [arr];
    }

    saveModel(server, token, onload=null) {
        SaveData(server, 'ImageTransfer', token, JSON.stringify(this.memo), onload);
    }

    loadModel(server, token) {
        LoadData(server, 'ImageTransfer', token, (data)=>{
            this.classifier = knnClassifier.create();
            this.memo = JSON.parse(data);
            Object.keys(this.memo).forEach((key)=>{
                this.memo[key].forEach((arr)=>{
                    const activation = tf.tensor(JSON.parse(arr));
                    this.classifier.addExample(activation, key);
                    tf.dispose(activation);
                });
            })
        })  
    }

    async predictClass(img) {
        const activation = this.featureExtractor.infer(img, 'conv_preds');
        return await this.classifier.predictClass(activation);
    }
}
