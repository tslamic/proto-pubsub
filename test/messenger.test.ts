import 'mocha';
import * as sinon from "sinon";
import {expect} from 'chai';
import {PubSubMessenger} from "../src/messenger";

const PubSub = require(`@google-cloud/pubsub`);

const chai = require("chai");
chai.should();

const assert = chai.assert;

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const EMPTY_BUFFER = Buffer.alloc(0);

describe("pubsub messenger tests", () => {
  it('should fail to publish a message because topic does not exist', () => {
    const topicName = "cool-topic";

    const pubsub = new PubSub();
    const topic = {
      exists: sinon.stub().returns(Promise.resolve([false])),
    };

    sinon.stub(pubsub, "topic").returns(topic);

    const messenger = new PubSubMessenger(pubsub);
    return messenger.publish(topicName, EMPTY_BUFFER)
      .should.eventually.be.rejectedWith(Error);
  });

  it('should successfully publish a message', () => {
    const topicName = "cool-topic";
    const messageId = "messageId";

    const pubsub = new PubSub();
    const publisher = {
      publish: sinon.stub().returns(Promise.resolve(messageId))
    };
    const topic = {
      exists: sinon.stub().returns(Promise.resolve([true])),
      publisher: sinon.stub().returns(publisher)
    };

    sinon.stub(pubsub, "topic").returns(topic);

    const messenger = new PubSubMessenger(pubsub);
    return messenger.publish(topicName, EMPTY_BUFFER)
      .should.eventually.be.equal(messageId);
  });

  it('should fail to subscribe because topic does not exist', () => {
    const topicName = "cool-topic";
    const subscriptionName = "cool-subscription";

    const pubsub = new PubSub();
    const topic = {
      exists: sinon.stub().returns(Promise.resolve([false]))
    };

    sinon.stub(pubsub, "topic").returns(topic);

    const messenger = new PubSubMessenger(pubsub);
    return messenger.subscribe(topicName, subscriptionName, sinon.stub())
      .should.eventually.be.rejectedWith(Error);
  });

  it('should equal existing subscription', (done) => {
    const topicName = "cool-topic";
    const subscriptionName = "cool-subscription";

    const pubsub = new PubSub();
    const emitter = sinon.spy();
    const subscription = {
      exists: sinon.stub().returns(Promise.resolve([true])),
      on: emitter
    };
    const topic = {
      exists: sinon.stub().returns(Promise.resolve([true])),
      subscription: sinon.stub().returns(subscription)
    };

    sinon.stub(pubsub, "topic").returns(topic);

    const messenger = new PubSubMessenger(pubsub);
    messenger.subscribe(topicName, subscriptionName, sinon.spy())
      .then(sub => {
        assert.equal(sub, subscription);
        assert.isTrue(emitter.calledTwice);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should create a new subscription', (done) => {
    const topicName = "cool-topic";
    const subscriptionName = "cool-subscription";

    const pubsub = new PubSub();
    const subscription = {
      exists: sinon.stub().returns(Promise.resolve([false])),
      on: sinon.spy(),
    };
    const createdSubscription = {
      on: sinon.spy()
    };
    const topic = {
      exists: sinon.stub().returns(Promise.resolve([true])),
      subscription: sinon.stub().returns(subscription),
      createSubscription:
        sinon.stub().returns(Promise.resolve([createdSubscription]))
    };

    sinon.stub(pubsub, "topic").returns(topic);

    const messenger = new PubSubMessenger(pubsub);
    messenger.subscribe(topicName, subscriptionName, sinon.spy())
      .then(sub => {
        assert.notEqual(sub, subscription);
        assert.equal(sub, createdSubscription);
        assert.isTrue(createdSubscription.on.calledTwice);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should unsubscribe', (done) => {
    const topicName = "cool-topic";
    const subscriptionName = "cool-subscription";

    const pubsub = new PubSub();
    const emitter = sinon.spy();
    const subscription = {
      exists: sinon.stub().returns(Promise.resolve([true])),
      removeListener: emitter
    };
    const topic = {
      exists: sinon.stub().returns(Promise.resolve([true])),
      subscription: sinon.stub().returns(subscription),
    };

    sinon.stub(pubsub, "topic").returns(topic);

    const messenger = new PubSubMessenger(pubsub);
    messenger.unsubscribe(topicName, subscriptionName, sinon.spy())
      .then(sub => {
        assert.isTrue(emitter.calledTwice);
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
