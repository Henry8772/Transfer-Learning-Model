# Introduction

This project contains 3 few-shots learning samples.

To start these demos, please start a https server:

```
python3 app.py
```

Start up your browser, input "127.0.0.1:5000".

# Image

This image demo is implemented by MobileNet FeatureExtractor + KNN,

A 1024 tensor (embedding) is generated from MobileNet Feature Extractor,
then, this tensor is sent to KNN classification to measure the eular distance.

When the demo is loaded successfully, a video should be shown. If this video
is not shown, please check if your webcam is connected or [permission issue](#permission-issue).

When you click `Add-A`, a sample for label A is added(others are same). It is better to ensure this possibility to up than 0.9.

This demo has no explicit training step, when you add a sample, the KNN classification will calculate the distance realtime. 

Few-shots learning depends on the capability of MobileNet's feature extractor.
This feature extractor is trained by huge image dataset, it has the capability to understand the most features of images.

## initialize()
Initialize classifier and feature extractor.

## addSample(image, classId)
This `image` should be an image element which refer to an image.
`classId` might be integer or string, which corresponding to the label of image.

Before call `predictClass()`, samples should be prepared.

## predictClass(img)
Produce the predict label for input image.

# AudioPrint

This image demo is implemented by Browser FFT pretrained model and a convolution
neural network. Browser FFT pretrained model contained a pretrained model, which can extract audio features with a 2D space. By this audio extractor,
a sharrow convolution neural network performed a few-shot learning according to providing sample.

## buildModel()
This MUST be called at first to ensure audio BrowserFFT is loaded.

## addExample(data, label)
This is window data of audio samples. Notice, this data has already been processed by BrowserFFT, which extracted audio feature from raw audio signal.

## train(cb)
This function performed training, using trainging samples added by `addExample()`. The training result is shown by cb.

## predict(data, cb)
A callback is provided to collect the predict result. This function will return the predict result for a small time-piece. In order to obtain an accumulated prediction, The following statistic function is needed:
```
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
```

This function performs a statistics for a customized window length (defined by `SAMPLE_TOTAL`).

## saveModel(server, token, cb)
This function save training state to specified storage service.
server is the prefix of server, for example:
```
http://127.0.0.1:5000
```
The token represents user token, which is unique identifier for each user, for example:
```
u0001
```

## loadModel(server, token, onload)
This function load training state from a storage service, when data is retreived, the classifier will be re-trained immediately.


# Motion

Motion is implemented by Dynamic Time Wraping and KNN classfication.
Special tricky is also applied to improve the performance greatly.

## addSample(sample, label)
```
sample = [a_sample, ...]

a_sample = 
[
			"acceleration": {
				"x": -2.8388571062520143,
				"y": -15.427391448438167,
				"z": -9.615620063143968
			},
			"accelerationIncludingGravity": {
				"x": -3.817704257788136,
				"y": -7.27149030162394,
				"z": -4.25898430916667
			},
			"rotationRate": {
				"alpha": -18.174182277562007,
				"beta": 1.7230825577703817,
				"gamma": -3.7698866270085722
			}
		},
        ...
]
```

`label` might be integer or string, which corresponding to a class of training samples.

## predict(sample)
Produce the prediction of a sample.

This output has the following structure:

```
[predict_label, [possibility_for_each_label, ...]]
```

To common use case, user only need to take first item of this array.

# Others

## Permission issue

I found it has problem in iphone to run audio and image demo.
This might be caused by permission issue. Since I do not have debug environment, this issue is still remained.

## tfjs-models

If you have any extra customization requirement, please refer to [this](https://github.com/woodylee1974/tfjs-models.git), this contains trivial modification for adapting this project.

