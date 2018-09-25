import {Publisher, PubSub, Subscription, Topic} from "@google-cloud/pubsub";

export interface SubscriptionListener {
  /**
   * Invoked when a new message is received.
   *
   * @param message the message received from the PubSub.
   */
  onReceived(message): void,

  /**
   * Invoked on erroneous behaviour.
   *
   * @param err the error.
   */
  onError(err): void
}

export interface SubscriptionCreator {
  /**
   * Creates a new Subscription.
   *
   * @param pubsub the PubSub instance.
   * @param topic the Topic instance. Guaranteed to exist.
   * @param subscriptionName
   */
  create(pubsub: PubSub, topic: Topic, subscriptionName: string): Promise<Subscription>
}

export interface Messenger {
  /**
   * Publishes a message.
   */
  publish(data: Buffer, attributes?: Publisher.Attributes): Promise<string>

  /**
   * Subscribes to a topic and listens for incoming messages.
   * To unsubscribe, call close() on the received Subscription instance.
   */
  subscribe(subscriptionName: string,
            listener: SubscriptionListener,
            creator?: SubscriptionCreator): Promise<Subscription>;
}

const SimpleCreator: SubscriptionCreator = {
  create(pubsub: PubSub, topic: Topic, subscriptionName: string): Promise<Subscription> {
    return topic.createSubscription(subscriptionName)
      .then(subscriptionResponse => {
        return subscriptionResponse[0];
      });
  }
};

class SimpleMessenger implements Messenger {
  private readonly topicName: string;
  private readonly pubsub: PubSub;

  constructor(topicName: string, pubsub: PubSub) {
    this.topicName = topicName;
    this.pubsub = pubsub;
  }

  publish(data: Buffer, attributes?: Publisher.Attributes): Promise<string> {
    return this.topic()
      .then(topic => {
        return topic.publisher().publish(data, attributes);
      });
  }


  subscribe(subscriptionName: string,
            listener: SubscriptionListener,
            creator: SubscriptionCreator = SimpleCreator): Promise<Subscription> {
    return this.subscription(subscriptionName, creator)
      .then(subscription => {
        subscription.on('message', listener.onReceived);
        subscription.on('error', listener.onError);
        return subscription;
      });
  }

  // https://github.com/googleapis/google-cloud-node/issues/696#issuecomment-116835719
  private topic(): Promise<Topic> {
    const topic = this.pubsub.topic(this.topicName);
    return topic.exists()
      .then(response => {
        if (this.exists((response))) {
          return topic;
        } else {
          throw Error(`Topic '${this.topicName}' does not exist. 
          Any published messages will be lost. Please create the topic manually.`);
        }
      });
  }

  private subscription(subscriptionName: string,
                       creator: SubscriptionCreator): Promise<Subscription> {
    return this.topic()
      .then(topic => {
        const subscription = topic.subscription(subscriptionName);
        return subscription.exists()
          .then(response => {
            if (this.exists(response)) {
              return subscription;
            } else {
              return creator.create(this.pubsub, topic, subscriptionName);
            }
          });
      })
  }

  private exists(response: any[]): boolean {
    return response && response[0];
  }
}

export class PubSubMessenger {
  private readonly pubsub: PubSub;

  constructor(pubsub: PubSub) {
    this.pubsub = pubsub;
  }

  using(topicName: string): Messenger {
    return new SimpleMessenger(topicName, this.pubsub);
  }
}
