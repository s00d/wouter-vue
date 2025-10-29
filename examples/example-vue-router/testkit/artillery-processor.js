import { EventEmitter } from 'events';

const eventEmitter = new EventEmitter();

export function generateNavigationFlow(context, events, done) {
  const routes = [];
  
  // Generate all routes from 1 to 200
  for (let i = 2; i <= 200; i++) {
    routes.push({
      url: `/route${i}`,
      method: 'GET'
    });
  }
  
  // Execute all routes
  for (const route of routes) {
    events.emit('request', {
      method: route.method,
      path: route.url,
      headers: context.vars
    });
  }
  
  done();
}

export function beforeRequest(requestParams, context, events, done) {
  return done();
}

export function afterResponse(requestParams, response, context, events, done) {
  // Log response time for each route
  if (response.headers && response.headers['x-response-time']) {
    console.log(`${requestParams.path}: ${response.headers['x-response-time']}ms`);
  }
  
  return done();
}

