/**
 * Utility functions
 */
const FLAG_TYPED_ARRAY = "FLAG_TYPED_ARRAY";
var context = typeof window === "undefined" ? global : window;
function F32Stringify(f32a)
{
    return JSON.stringify(f32a,  (key, value )=>{
        if ( value instanceof Int8Array         ||
             value instanceof Uint8Array        ||
             value instanceof Uint8ClampedArray ||
             value instanceof Int16Array        || 
             value instanceof Uint16Array       ||
             value instanceof Int32Array        || 
             value instanceof Uint32Array       || 
             value instanceof Float32Array      ||
             value instanceof Float64Array       )
        {
          var replacement = {
            constructor: value.constructor.name,
            data: Array.apply([], value),
            flag: FLAG_TYPED_ARRAY
          }
          return replacement;
        }
        return value;
    })
}

function F32Parse(f32a)
{
    return JSON.parse(f32a, (key, value)=>{
        try{
          if( "flag" in value && value.flag === FLAG_TYPED_ARRAY){
            return new context[value.constructor](value.data);
          }
        }catch(e){}
        return value;
    });
}


function SaveData(server, app, token, data, onload)
{
    const http = new XMLHttpRequest()
    http.open('POST', `${server}/put_memo/${app}/${token}`);
    http.setRequestHeader('Content-type', 'application/json');
    http.send(data);
    http.onload = onload;
}

function LoadData(server, app, token, onload) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", (e)=>{
        onload(oReq.responseText);
    });
    oReq.open("GET", `${server}/get_memo/${app}/${token}`);
    oReq.send();
}
