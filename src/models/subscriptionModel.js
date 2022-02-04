class Subscription {
  normalize = (subscriptionData) => {
    return {
      clientId: subscriptionData.clientId,
      host: subscriptionData.host,
      organizationId: subscriptionData.organizationId,
      password: subscriptionData.password,
      port: subscriptionData.port,
      protocol: subscriptionData.protocol,
      publishAcl: subscriptionData.publishAcl,
      subscribeAcl: subscriptionData.subscribeAcl,
      subscriptionDate: subscriptionData.subscriptionDate,
      topic: subscriptionData.topic,
      userId: subscriptionData.userId,
      username: subscriptionData.username,
      isEnabled: subscriptionData.isEnable,
      subscriptionType: 'MQTT',
      username: subscriptionData.username
    };
  }
}

export default Subscription;