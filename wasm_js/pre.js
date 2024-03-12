function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const msgMap = {};

// When a new message is received from main
self.onmessage = function (event) {
  msgMap[event.data.topic] = {
    message: event.data.message ? event.data.message.replaceAll(", ", "\n") : undefined,
    isStale: false
  };
}

function registerParticipant(topic_name, role) {
  topic = topic_name;
  let gid = Math.random().toString(16).slice(2)

  // Register new participant with main
  self.postMessage({
    command: "register",
    topic: topic_name,
    role: role,
    gid: gid
  });

  return gid;
}

function deregisterParticipant(gid, role) {
  // Deregister participant from main
  self.postMessage({
    command: "deregister",
    topic: topic,
    role: role,
    gid: gid
  });

  // TODO: check deregristration
  return true;
}

function publishMessage(message, topic_name) {
  // Send message to main
  self.postMessage({
    command: "publish",
    topic: topic_name,
    message: message
  });

  // Assume it gets published
  return true;
}

async function retrieveMessage(topic_name) {

  if ((topic_name in msgMap) && !msgMap[topic_name].isStale) {
    msgMap[topic_name].isStale = true;
    return msgMap[topic_name].message;
  } else {
    // Trigger main to send new message
    self.postMessage({
      command: "retrieve",
      topic: topic_name
    });

    await sleep(10);
    return "";
  }
}
