import json
import glob
import fastdtw
import os
import numpy as np
from numpy.linalg import norm


def wrap_fastdtw(a, b):
    def dist_func(x, y):
        return np.sqrt((x[0] - y[0]) * (x[0] - y[0]) +
                       (x[1] - y[1]) * (x[1] - y[1]) +
                       (x[2] - y[2]) * (x[2] - y[2]))
    return fastdtw.dtw(a, b, dist_func)[0]


class DTWKNN:
    def __init__(self, k=4, distance_metric=wrap_fastdtw):
        self.k = k
        self.distance = distance_metric
        self.samples = {}

    def fit(self, samples, label):
        if label in self.samples:
            self.samples[label].append(samples)
        else:
            self.samples[label] = [samples]

    def predict(self, sample):
        neighbors = []
        distances = {}
        for label, samples in self.samples.items():
            for _sample in samples:
                distances[self.distance(_sample, sample)] = label
        for key in sorted(distances.keys())[:self.k]:
            neighbors.append(distances[key])
        return max(set(neighbors), key=neighbors.count)

DataKey = 'accelerationIncludingGravity'
#DataKey = 'acceleration'
#DataKey = 'rotationRate'

x='x'
y='y'
z='z'
# x='alpha'
# y='beta'
# z='gamma'

dtw_knn = DTWKNN()
json_files = glob.glob("*.json")
test_data = {}
for json_file in json_files:
    label = os.path.basename(json_file).split('.')[0]
    train_data = json.load(open(json_file, "r"))
    for sample in train_data[:-5]:
        dtw_knn.fit([(d[DataKey][x],
                      d[DataKey][y],
                      d[DataKey][z]) for d in sample], label)
    test_data[label] = []
    for sample in train_data[-5:]:
        test_data[label].append([(d[DataKey][x],
                      d[DataKey][y],
                      d[DataKey][z]) for d in sample])

# for td in test_data:
#     t_sample = [(d['acceleration']['x'],
#                  d['acceleration']['y'],
#                  d['acceleration']['z']) for d in td]
#     pred = dtw_knn.predict(t_sample)
#     print(pred)

for label, samples in test_data.items():
    for sample in samples:
        pred = dtw_knn.predict(sample)
        print("pred:{}, gt:{}".format(pred, label))

