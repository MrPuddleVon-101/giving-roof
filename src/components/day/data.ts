// Arch windows on the campus render (1672 x 941), as [x0, x1, y0, y1].
// Twenty are used: each one stands for 5% of a verified net saving.
const L_UP: number[][] = [[476, 512, 492, 566], [525, 560, 491, 567], [576, 611, 491, 570], [626, 664, 491, 572], [681, 722, 491, 574]]
const R_UP: number[][] = [[851, 906, 490, 582], [930, 987, 490, 585], [1011, 1071, 490, 592], [1101, 1175, 489, 598], [1207, 1288, 488, 604]]
const L_LO: number[][] = [[478, 511, 597, 672], [525, 560, 597, 680], [574, 611, 597, 688], [626, 665, 597, 697], [681, 722, 598, 708]]
const R_LO: number[][] = [[850, 905, 621, 718], [929, 987, 623, 737], [1011, 1074, 625, 755], [1101, 1178, 628, 775], [1208, 1290, 634, 790]]
export const WINDOWS = [...L_UP, ...R_UP, ...L_LO, ...R_LO].sort((a, b) => a[0] - b[0] || a[2] - b[2])
/** The four windows closest to the entrance arch: 4 of 20 is 20%. */
export const SHARE = new Set(
  WINDOWS.map((w, i) => ({ i, d: Math.abs((w[0] + w[1]) / 2 - 782) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
    .map((x) => x.i),
)

// Solar canopy in the roof render: column lines from the front edge to the back edge.
const c = (x: number, y: number): [number, number] => [x / 2 + 320, y / 2 + 260]
export const COLS: [[number, number], [number, number]][] = [
  [c(1262, 390), c(2108, 42)],
  [c(1062, 384), c(1955, 52)],
  [c(845, 376), c(1760, 69)],
  [c(675, 374), c(1590, 89)],
  [c(520, 369), c(1410, 104)],
  [c(385, 365), c(1230, 122)],
  [c(285, 362), c(1010, 146)],
  [c(200, 359), c(840, 176)],
  [c(120, 356), c(640, 212)],
  [c(45, 353), c(330, 290)],
]
export const ROWS = [0, 0.5, 0.755, 1]
