[![CircleCI](https://circleci.com/gh/tslamic/proto-pubsub.svg?style=svg)](https://circleci.com/gh/tslamic/proto-pubsub)  
[![Coverage Status](https://coveralls.io/repos/github/tslamic/proto-pubsub/badge.svg?branch=master)](https://coveralls.io/github/tslamic/proto-pubsub?branch=master)  

# simple-pubsub  

Simplifies publishing and subscribing to the [GCP's PubSub](https://cloud.google.com/pubsub/docs/overview). A topic you publish or subscribe to must be already created - an Error will be thrown otherwise. Read more about this design decision [here](https://github.com/googleapis/google-cloud-node/issues/696#issuecomment-116835719).

## How to use it

First, create a `PubSub` instance and wrap it in a `PubSubMessenger` instance:

```js
const PubSub = require('@google-cloud/pubsub');
const messenger = new PubSubMessenger(new PubSub());  
```

Use the `messenger` to either `publish`:

```js 
const buffer = Buffer.from("Hello, World!");  
messenger.using("my-awesome-topic").publish(buffer);  
```  

or `subscribe`:

```js 
let listener = {
  onReceived: (message) => {
    message.ack();
    console.log(message);
  },
  onError: (err) => {
    console.error(err);
  }
};

messenger.using("my-awesome-topic").subscribe("my-subscription", listener);  
```  

If `my-subscription` doesn't exists, it will be created.

## License

    Copyright 2018 Tadej Slamic
    
    Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
    
    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
