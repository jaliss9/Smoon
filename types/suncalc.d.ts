declare module 'suncalc' {
  export interface MoonIllumination {
    fraction: number;
    phase: number;
    angle: number;
  }

  export interface MoonPosition {
    azimuth: number;
    altitude: number;
    distance: number;
    parallacticAngle: number;
  }

  export interface MoonTimes {
    rise?: Date;
    set?: Date;
    alwaysUp?: boolean;
    alwaysDown?: boolean;
  }

  export function getMoonIllumination(date: Date): MoonIllumination;
  export function getMoonPosition(date: Date, lat: number, lng: number): MoonPosition;
  export function getMoonTimes(date: Date, lat: number, lng: number): MoonTimes;
  
  const SunCalc: {
    getMoonIllumination: typeof getMoonIllumination;
    getMoonPosition: typeof getMoonPosition;
    getMoonTimes: typeof getMoonTimes;
  };
  
  export default SunCalc;
}
