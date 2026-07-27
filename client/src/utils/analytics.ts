import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = '2fb55a5b1ea285872b1ab4e405f76ac6';

// Initialize Mixpanel with local storage persistence
mixpanel.init(MIXPANEL_TOKEN, {
  debug: false,
  track_pageview: true,
  persistence: 'localStorage'
});

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    mixpanel.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      screen: properties?.screen || 'unknown'
    });
  } catch (error) {
    console.error('Mixpanel track error:', error);
  }
};

export const identifyUser = (distinctId: string, traits?: Record<string, any>) => {
  try {
    mixpanel.identify(distinctId);
    if (traits) {
      const userNickname = traits.name || traits.nickname || traits.$name;
      const formattedTraits: Record<string, any> = {
        ...traits,
        ...(userNickname ? { $name: userNickname, name: userNickname, nickname: userNickname } : {})
      };
      mixpanel.people.set(formattedTraits);
    }
  } catch (error) {
    console.error('Mixpanel identify error:', error);
  }
};

export default mixpanel;
