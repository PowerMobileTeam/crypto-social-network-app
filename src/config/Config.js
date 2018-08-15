import {
  Platform
} from 'react-native';

// export const MINDS_URI = 'https://www.minds.com/';
// export const MINDS_URI = 'http://dev.minds.io/';

// remember to update deeplink uri on AndroidManifest.xml !!!
export const MINDS_URI = 'https://www.minds.com/';

export const MINDS_URI_SETTINGS = {
  //basicAuth: 'crypto:ohms',
};

export const MINDS_MAX_VIDEO_LENGTH = 5; // in minutes

export const SOCKET_URI = 'wss://ha-socket-io-us-east-1.minds.com:3030'

export const MINDS_CDN_URI = 'https://cdn.minds.com/';
export const MINDS_ASSETS_CDN_URI = 'https://cdn-assets.minds.com/';
// export const MINDS_CDN_URI = 'http://dev.minds.io/';

export const BLOCKCHAIN_URI = 'https://rinkeby.infura.io/';
// export const BLOCKCHAIN_URI = 'http://localhost:9545';
export const MINDS_LINK_URI = 'https://www.minds.com/';

export const MINDS_FEATURES = {
  crypto: Platform.OS === 'ios' ? false : true,
  monetization: true,
  legacy: false,
};

/**
 * Deeplink to screen/params maping
 */
export const MINDS_DEEPLINK = [
  ['groups/profile/:guid', 'GroupView'],
  ['newsfeed/:guid', 'Activity'],
  ['channels/:username', 'Channel'],
]
