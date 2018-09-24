import {Publisher, PubSub, Subscription, Topic} from "@google-cloud/pubsub";

export type Listener = {
  onReceived: (message) => void,
  onError: (err) => void
}

export interface Messenger {
  /**
   * Publishes a message.
   */
  publish(topicName: string,
          data: Buffer,
          attributes?: Publisher.Attributes): Promise<string>

  /**
   * Subscribes to a topic and listens for incoming messages.
   */
  subscribe(topicName: string,
            subscriptionName: string,
            listener: Listener): Promise<Subscription>;

  /**
   * Unsubscribes from a topic.
   */
  unsubscribe(topicName: string,
              subscriptionName: string,
              listener: Listener): Promise<Subscription>;
}

export class PubSubMessenger implements Messenger {
  private pubsub: PubSub;

  constructor(pubsub: PubSub) {
    this.pubsub = pubsub;
  }

  publish(topicName: string,
          data: Buffer,
          attributes?: Publisher.Attributes): Promise<string> {
    return this.ensureTopicExists(topicName)
      .then(topic => {
        return topic
          .publisher()
          .publish(data, attributes);
      });
  }

  subscribe(topicName: string,
            subscriptionName: string,
            listener: Listener): Promise<Subscription> {
    return this.getOrCreateSubscription(topicName, subscriptionName)
      .then(subscription => {
        subscription.on('message', listener.onReceived);
        subscription.on('error', listener.onError);
        return subscription;
      });
  }

  unsubscribe(topicName: string,
              subscriptionName: string,
              listener: Listener): Promise<Subscription> {
    return this.ensureTopicExists(topicName)
      .then(topic => {
        const subscription = topic.subscription(subscriptionName);
        subscription.removeListener('message', listener.onReceived);
        subscription.removeListener('error', listener.onError);
        return subscription;
      });
  }

  // See the following comment for more details:
  // https://github.com/googleapis/google-cloud-node/issues/696#issuecomment-116835719
  private ensureTopicExists(topicName: string): Promise<Topic> {
    const topic = this.pubsub.topic(topicName);
    return topic.exists()
      .then(response => {
        if (PubSubMessenger.exists((response))) {
          return topic;
        } else {
          throw Error(`Topic '${topicName}' does not exist, 
          any published messages will be lost. Please create the topic manually.`);
        }
      });
  }

  private getOrCreateSubscription(topicName: string,
                                  subscriptionName: string): Promise<Subscription> {
    return this.ensureTopicExists(topicName)
      .then(topic => {
        const subscription = topic.subscription(subscriptionName);
        return subscription.exists()
          .then(response => {
            if (PubSubMessenger.exists(response)) {
              return subscription;
            } else {
              return this.createSubscription(topic, subscriptionName);
            }
          });
      })
  }

  private createSubscription(topic: Topic,
                             subscriptionName: string): Promise<Subscription> {
    return topic.createSubscription(subscriptionName)
      .then(subscriptionResponse => {
        return subscriptionResponse[0];
      });
  }

  private static exists(response: any[]): boolean {
    return response && response[0];
  }
}
