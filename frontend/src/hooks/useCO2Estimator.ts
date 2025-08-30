import { useState, useEffect } from 'react';

const estimateCO2 = (dist_km: number | string, weight_t: number, mode: string): number | string => {
  const factors: { [key: string]: number } = {
    truck: 62,
    rail: 22,
    air: 602,
  };

  if (typeof dist_km !== 'number') {
    return 'N/A';
  }

  return parseFloat((dist_km * weight_t * (factors[mode] || 62)).toFixed(2));
};

interface CO2EstimatorHook {
  co2Emissions: number | string;
}

const useCO2Estimator = (distance: number | string, weight: number, mode: string): CO2EstimatorHook => {
  const [co2Emissions, setCo2Emissions] = useState<number | string>('N/A');

  useEffect(() => {
    if (distance !== 'N/A' && weight > 0 && mode) {
      setCo2Emissions(estimateCO2(distance, weight, mode));
    } else {
      setCo2Emissions('N/A');
    }
  }, [distance, weight, mode]);

  return { co2Emissions };
};

export default useCO2Estimator;