// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const defaultconfig = getDefaultConfig(__dirname);

// Add wasm asset support
defaultconfig.resolver.assetExts.push('wasm');
 
// Add COEP and COOP headers to support SharedArrayBuffer
defaultconfig.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    middleware(req, res, next);
  };
};

defaultconfig.resolver.assetExts.push("db");

module.exports = defaultconfig;
