import os
from flask import Flask
from flask import request
from flask import send_from_directory
app = Flask(__name__, static_folder='')

@app.route('/')
@app.route("/<path:filename>")
def static_handler(*args, **kwargs):
    if 'filename' in kwargs:
        return send_from_directory('', kwargs['filename'])
    return send_from_directory('', 'index.html')


@app.route('/put_memo/<string:app>/<string:token>', methods=("POST", ))
def put_memo(*args, **kwargs):
    app, token = kwargs['app'], kwargs['token']
    print('app: {}'.format(app))
    print('token:{}'.format(token))
    with open("{}-{}.dat".format(app, token), "wb") as f:
        f.write(request.data)
        print("{}-{}.dat is saved.".format(app, token))
    return 'OK'


@app.route('/get_memo/<string:app>/<string:token>', methods=("GET", ))
def get_memo(*args, **kwargs):
    app, token = kwargs['app'], kwargs['token']
    print('app: {}'.format(app))
    print('token:{}'.format(token))
    return open("{}-{}.dat".format(app, token), "rb").read().decode(encoding='utf-8')


if __name__ == "__main__":
    app.run(ssl_context=('server.crt', 'server.key'), host='0.0.0.0')