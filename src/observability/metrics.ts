import { collectDefaultMetrics, Registry } from 'prom-client';
import { SERVICE_NAME } from '../config/service-info';

export const metricsRegister = new Registry();

metricsRegister.setDefaultLabels({
  service: SERVICE_NAME,
});

collectDefaultMetrics({
  register: metricsRegister,
  prefix: 'be_chsrc_construct_',
});
