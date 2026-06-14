import { Sensor } from '@zos/sensor';

const sensor = new Sensor();

export const sensorAdapter = {
  getSteps() {
    try {
      return sensor.getStepCount() || 0;
    } catch (e) {
      return 0;
    }
  },
};
