import type { App } from 'vue';
import type { ArcoOptions } from '../_utils/types';
import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import { configProviderInjectionKey } from './context';
import _ConfigProvider from './config-provider.vue';

const ConfigProvider = Object.assign(_ConfigProvider, {
  configProviderInjectionKey,
  install: (app: App, options?: ArcoOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _ConfigProvider.name, _ConfigProvider);
  },
});

export type ConfigProviderInstance = InstanceType<typeof _ConfigProvider>;

export default ConfigProvider;
