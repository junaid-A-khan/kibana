/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Route } from 'react-router-dom';

import { HostList } from './view';

export const endpointHostsRoutes = () => [
  <Route path="/:pageName(endpoint-hosts)">
    <HostList />
  </Route>,
];
