import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/findout-app/__docusaurus/debug',
    component: ComponentCreator('/findout-app/__docusaurus/debug', 'b25'),
    exact: true
  },
  {
    path: '/findout-app/__docusaurus/debug/config',
    component: ComponentCreator('/findout-app/__docusaurus/debug/config', 'aa6'),
    exact: true
  },
  {
    path: '/findout-app/__docusaurus/debug/content',
    component: ComponentCreator('/findout-app/__docusaurus/debug/content', '6c4'),
    exact: true
  },
  {
    path: '/findout-app/__docusaurus/debug/globalData',
    component: ComponentCreator('/findout-app/__docusaurus/debug/globalData', 'cf3'),
    exact: true
  },
  {
    path: '/findout-app/__docusaurus/debug/metadata',
    component: ComponentCreator('/findout-app/__docusaurus/debug/metadata', '5de'),
    exact: true
  },
  {
    path: '/findout-app/__docusaurus/debug/registry',
    component: ComponentCreator('/findout-app/__docusaurus/debug/registry', '23b'),
    exact: true
  },
  {
    path: '/findout-app/__docusaurus/debug/routes',
    component: ComponentCreator('/findout-app/__docusaurus/debug/routes', '9e0'),
    exact: true
  },
  {
    path: '/findout-app/docs',
    component: ComponentCreator('/findout-app/docs', 'd22'),
    routes: [
      {
        path: '/findout-app/docs/building-release',
        component: ComponentCreator('/findout-app/docs/building-release', 'd9a'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/findout-app/docs/ci-cd',
        component: ComponentCreator('/findout-app/docs/ci-cd', '4b6'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/findout-app/docs/development-guide',
        component: ComponentCreator('/findout-app/docs/development-guide', 'a28'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/findout-app/docs/getting-started',
        component: ComponentCreator('/findout-app/docs/getting-started', '9cc'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/findout-app/docs/intro',
        component: ComponentCreator('/findout-app/docs/intro', 'f23'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/findout-app/docs/project-architecture',
        component: ComponentCreator('/findout-app/docs/project-architecture', 'f94'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/findout-app/docs/services-integration',
        component: ComponentCreator('/findout-app/docs/services-integration', '039'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/findout-app/docs/troubleshooting',
        component: ComponentCreator('/findout-app/docs/troubleshooting', 'ef6'),
        exact: true,
        sidebar: "docs"
      }
    ]
  },
  {
    path: '/findout-app/',
    component: ComponentCreator('/findout-app/', 'aa6'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
