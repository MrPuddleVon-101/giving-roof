import { pipeCurve } from './materials'
import { H, PV, DOWNPIPE, TANK, SWITCHBOARD, TOILET_ZS } from './layout'

// Physical routes. Pipes and cables are drawn along these and the flow
// particles travel the same curves, so what moves is what is built.

const D = DOWNPIPE
const tankTop = TANK.y + TANK.r

/** Rain: off the low edge of the canopy, across the drained roof to the gutter, down the pipe into the tank. */
export const rainRoofRun = pipeCurve(
  [
    [18, H + 0.5, PV.z1 + 0.9],
    [31.2, H + 0.5, D.z - 0.1],
    [D.x, H + 0.55, D.z],
  ],
  0.8,
)

export const downpipe = pipeCurve(
  [
    [D.x, H + 0.55, D.z],
    [D.x, 2.95, D.z],
    [TANK.x, 2.95, D.z],
    [TANK.x, 2.95, TANK.z + 1.9],
    [TANK.x, tankTop - 0.05, TANK.z + 1.9],
  ],
  0.4,
)

/** Non-potable supply: tank outlet, pump, meter, riser into the service zone, header over the cisterns. */
export const supply = pipeCurve(
  [
    [TANK.x - TANK.r, 0.55, TANK.z - 1.6],
    [33.6, 0.55, TANK.z - 1.6],
    [33.6, 0.55, 6.2],
    [31.2, 0.55, 6.2],
    [31.2, 3.75, 6.2],
    [27.6, 3.75, 6.2],
    [27.6, 3.75, TOILET_ZS[0] - 0.3],
  ],
  0.35,
)

export const drops = TOILET_ZS.map((z) =>
  pipeCurve(
    [
      [27.6, 3.75, z],
      [27.6, 2.15, z],
    ],
    0.1,
  ),
)

/** Overflow: a separate outlet near the top of the tank to the rain garden. */
export const overflow = pipeCurve(
  [
    [TANK.x + TANK.r - 0.05, tankTop - 0.45, TANK.z + 1.2],
    [39.6, tankTop - 0.45, TANK.z + 1.2],
    [39.6, tankTop - 0.45, TANK.z + 2.6],
    [40.8, 0.45, TANK.z + 2.8],
  ],
  0.5,
)

/** PV cable: combiner under the array, down a column, across the roof, into the plant room switchboard. */
export const cable = pipeCurve(
  [
    [PV.x1 - 0.6, PV.lowY - 0.5, PV.z1 - 0.6],
    [PV.x1 - 0.6, H + 0.32, PV.z1 - 0.6],
    [30.6, H + 0.32, PV.z1 - 0.6],
    [30.6, H + 0.32, 2.2],
    [30.6, 9.9, 2.2],
    [27.7, 9.9, 2.2],
    [27.7, SWITCHBOARD[1] + 0.75, SWITCHBOARD[2] + 0.3],
  ],
  0.4,
)
