function DynamicTimeWarping ( ts1, ts2, distanceFunction ) {
    var ser1 = ts1;
    var ser2 = ts2;
    var distFunc = distanceFunction;
    var distance;
    var matrix;
    var path;

    var getDistance = function() {
        if ( distance !== undefined ) {
            return distance;
        }
        matrix = [];
        for ( var i = 0; i < ser1.length; i++ ) {
            matrix[ i ] = [];
            for ( var j = 0; j < ser2.length; j++ ) {
                var cost = Infinity;
                if ( i > 0 ) {
                    cost = Math.min( cost, matrix[ i - 1 ][ j ] );
                    if ( j > 0 ) {
                        cost = Math.min( cost, matrix[ i - 1 ][ j - 1 ] );
                        cost = Math.min( cost, matrix[ i ][ j - 1 ] );
                    }
                } else {
                    if ( j > 0 ) {
                        cost = Math.min( cost, matrix[ i ][ j - 1 ] );
                    } else {
                        cost = 0;
                    }
                }
                matrix[ i ][ j ] = cost + distFunc( ser1[ i ], ser2[ j ] );
            }
        }

        return matrix[ ser1.length - 1 ][ ser2.length - 1 ];
    };

    this.getDistance = getDistance;
}


K = 3
DS_STEP = 3

/**
 * This class is for gesture recognition.
 * This method allows variable length samples.
 */
class DtwKnn
{
    constructor() {
        this.samples = {};
    }

    _downscale(sample) {
        var ds_sample = []
        var ds_count = 0
        sample.forEach(
            (o)=>{
                if (ds_count % DS_STEP == 0) {
                    ds_sample.push(o);
                }
                ds_count ++;
            }
        )
        return ds_sample
    }

    addSample(sample, label) {
        if (label in this.samples) {
            this.samples[label].push(this._downscale(sample));
        }
        else {
            this.samples[label] = [this._downscale(sample)];
        }
    }

    getSampleNum(label=null) {
        if (label === null) {
            var count = 0;
            Object.keys(this.samples).forEach((key)=>{
                count += this.samples[key].length;
            });
            return count;
        }
        if (label in this.samples) {
            return this.samples[label].length;
        }
        else {
            return 0;
        }
    }

    clearSamples() {
        this.samples = {};
    }

    train() {
        //TODO: perform data clean, but current it is omitted.
    }

    saveModel(server, user_token, onload=null) {
        SaveData(server, 'DtwKnnGesture', user_token, JSON.stringify(this.samples), onload);
    }

    loadModel(server, user_token, onload=null) {
        LoadData(server, 'DtwKnnGesture', user_token, (data)=>{
            this.samples = JSON.parse(data);
            if (onload != null) {
                onload();
            }
        })
    }

    getMaxOccurs(data)
    {
        var modeMap = {};
        var maxEl = data[0], maxCount = 1;
        for(var i = 0; i < data.length; i++)
        {
            var el = data[i];
            if(modeMap[el] == null)
                modeMap[el] = 1;
            else
                modeMap[el]++;  
            if(modeMap[el] > maxCount)
            {
                maxEl = el;
                maxCount = modeMap[el];
            }
        }
        var possibility = {}
        Object.keys(modeMap).forEach((key)=>{
            possibility[key] = modeMap[key] / data.length;
        })
        return [maxEl, possibility];
    }

    distance_acc_g(obj_a, obj_b) {
        var a = obj_a.accelerationIncludingGravity;
        var b = obj_b.accelerationIncludingGravity;
        return Math.sqrt((a.x - b.x) * (a.x - b.x) +
        (a.y - b.y) * (a.y - b.y) +
        (a.z - b.z) * (a.z - b.z)
        );
    }

    distance_rot(obj_a, obj_b) {
        var a = obj_a.rotationRate;
        var b = obj_b.rotationRate;
        return Math.sqrt((a.alpha - b.alpha) * (a.alpha - b.alpha) +
        (a.beta - b.beta) * (a.beta - b.beta) +
        (a.gamma - b.gamma) * (a.gamma - b.gamma)
        );
    }

    predict(sample) {
        var _sample = this._downscale(sample);
        var neighbors = []
        var cbs = [this.distance_acc_g, this.distance_rot];
        cbs.forEach((cb)=>{
            var distances = {}
            Object.keys(this.samples).forEach((label) => {
                this.samples[label].forEach((in_sample)=>{
                    var dtw = new DynamicTimeWarping(in_sample, _sample, cb);
                    distances[dtw.getDistance()] = label;
                });
            });
            Object.keys(distances).sort().slice(0, K).forEach((distance)=>{
                neighbors.push(distances[distance])
            });
        });
        return this.getMaxOccurs(neighbors);
    }
}