export default {
  routes: [
    {
      method: 'GET',
      path: '/modules',
      handler: 'module.find',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/modules/:id',
      handler: 'module.findOne',
      config: { auth: false },
    },
  ],
};
