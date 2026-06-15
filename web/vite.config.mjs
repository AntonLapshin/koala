import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const root = path.resolve(__dirname, '..');
const webSrc = path.resolve(__dirname, 'src');

const watchAdapterReexports = {
  [path.resolve(root, 'utils/storageAdapter.js')]: `export { storageAdapter } from '${path.resolve(webSrc, 'adapters/storageAdapter.js')}';`,
  [path.resolve(root, 'utils/sensorAdapter.js')]: `export { stepsAdapter, sensorAdapter } from '${path.resolve(webSrc, 'adapters/stepsAdapter.js')}';`,
  [path.resolve(root, 'utils/timeAdapter.js')]: `export { timeAdapter } from '${path.resolve(webSrc, 'adapters/timeAdapter.js')}';`,
};

function zeppOsAdapter() {
  return {
    name: 'zepp-os-adapter',
    enforce: 'pre',
    resolveId(source) {
      if (source === '@zos/ui') return path.resolve(webSrc, 'hmUI.js');
      if (source === '@zos/sensor') return path.resolve(webSrc, 'zos-sensor.js');
      if (source === '@zos/fs') return path.resolve(webSrc, 'zos-fs.js');
    },
    load(id) {
      if (watchAdapterReexports[id]) {
        return watchAdapterReexports[id];
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), zeppOsAdapter()],
  resolve: {
    alias: {
      '@shared': path.resolve(root, 'shared'),
    },
  },
  server: {
    fs: {
      allow: [root],
    },
  },
});
