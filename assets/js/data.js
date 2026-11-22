/* CatWalking data. Edit numbers/text here. */
window.CW = {
  // Datawalk result: 22 cats. key = colour category; n = 1st approach (1 sleepy/not scared, 2 scared, 3 friendly);
  // l = 2nd approach (A eats in front of me, B waits until I leave); h = 3rd approach (more = asks for more / follows me, eating = keeps eating)
  cats: [{"id": "48", "key": "black", "n": 3, "l": "A", "h": "more", "w": 40, "hh": 70}, {"id": "85", "key": "black", "n": 3, "l": "A", "h": "more", "w": 124, "hh": 58}, {"id": "86", "key": "black", "n": 3, "l": "A", "h": "more", "w": 31, "hh": 72}, {"id": "34", "key": "black", "n": 1, "l": "A", "h": "eating", "w": 51, "hh": 68}, {"id": "41", "key": "black", "n": 2, "l": "A", "h": "more", "w": 69, "hh": 66}, {"id": "87", "key": "tabby", "n": 1, "l": "A", "h": "more", "w": 92, "hh": 70}, {"id": "106", "key": "ginger", "n": 1, "l": "A", "h": "more", "w": 98, "hh": 78}, {"id": "107", "key": "ginger", "n": 2, "l": "B", "h": "eating", "w": 82, "hh": 74}, {"id": "114", "key": "ginger", "n": 1, "l": "B", "h": "eating", "w": 60, "hh": 72}, {"id": "163", "key": "tortie", "n": 1, "l": "B", "h": "eating", "w": 62, "hh": 62}, {"id": "140", "key": "tortie", "n": 3, "l": "A", "h": "more", "w": 30, "hh": 72}, {"id": "150", "key": "tortie", "n": 3, "l": "A", "h": "eating", "w": 38, "hh": 72}, {"id": "164", "key": "tortie", "n": 3, "l": "A", "h": "eating", "w": 38, "hh": 68}, {"id": "141", "key": "tortie", "n": 1, "l": "A", "h": "more", "w": 44, "hh": 74}, {"id": "165", "key": "tortie", "n": 2, "l": "B", "h": "eating", "w": 64, "hh": 60}, {"id": "133", "key": "tortie", "n": 2, "l": "A", "h": "eating", "w": 56, "hh": 53}, {"id": "143", "key": "tortie", "n": 3, "l": "A", "h": "eating", "w": 48, "hh": 68}, {"id": "142", "key": "tortie", "n": 3, "l": "A", "h": "more", "w": 23, "hh": 74}, {"id": "172", "key": "orwh", "n": 3, "l": "B", "h": "eating", "w": 72, "hh": 70}, {"id": "179", "key": "orwh", "n": 1, "l": "B", "h": "eating", "w": 74, "hh": 64}, {"id": "180", "key": "unknown", "n": 3, "l": "A", "h": "more", "w": 48, "hh": 72}, {"id": "182", "key": "white", "n": 1, "l": "B", "h": "eating", "w": 124, "hh": 63}],
  distanceKm: 1.2,
  // Black vs orange split shown first in Our Result (percent)
  blackOrange: { black: 68, orange: 32 },
  // Google Apps Script web-app URL that saves a copy of each downloaded landscape picture to Drive (see tools/drive-archive.gs). Leave '' to switch off.
  archiveUrl: 'https://script.google.com/macros/s/AKfycbwCZYadNY7MSD3uSC0M0YrMapW3yz3jA2dAnbuSw_2qf1dK3jV5HPtt4OFM3rfFlnAZ/exec',
  categories: [
    { key: 'black',   label: 'Black / grey',            fill: '#1E1B1C', note: 'note_6' },
    { key: 'tabby',   label: 'Brown tabby',             fill: 'url(#p-tabby)', note: 'note_9' },
    { key: 'tortie',  label: 'Tortoiseshell / calico',  fill: 'url(#p-tortie)', note: 'note_8' },
    { key: 'ginger',  label: 'Ginger / cream',          fill: '#F4B984', note: 'note_11' },
    { key: 'orwh',    label: 'Orange & white',          fill: 'url(#p-orwh)', note: 'note_7' },
    { key: 'unknown', label: 'Unknown',                 fill: 'url(#p-unknown)', note: 'note_10' },
    { key: 'white',   label: 'Entirely white',          fill: '#FFFFFF', note: 'note_12' }
  ],
  approaches: [
    { id: 1, title: '1st Approach', when: 'Before feeding', field: 'n', options: [
      { v: 1, badge: '1', label: 'Sleepy, but not scared', color: '#094088' },
      { v: 2, badge: '2', label: 'Scared of me', color: '#326EA4' },
      { v: 3, badge: '3', label: 'Friendly', color: '#374389' } ] },
    { id: 2, title: '2nd Approach', when: 'While feeding', field: 'l', options: [
      { v: 'A', badge: 'A', label: 'Eats in front of me', color: '#13984C' },
      { v: 'B', badge: 'B', label: 'Waits until I leave', color: '#0D6232' } ] },
    { id: 3, title: '3rd Approach', when: 'After feeding', field: 'h', options: [
      { v: 'more', badge: '♡', label: 'Asks for more / follows me', color: '#880955' },
      { v: 'eating', badge: '♥', label: 'Keeps eating', color: '#9E36B8' } ] }
  ],
  // positions taken from the Figma/SVG exports (SVG units)
  route: { canvas: [1645, 834], map: [0.0, 30.7, 1579.3, 746.0], title: [63.3, 117.3, 507.7, 289.7], cats: [{"id": "180", "x": 332.3, "y": 74.3, "w": 100.7, "h": 202.3}, {"id": "182", "x": 459.7, "y": 319.3, "w": 204.7, "h": 190.3}, {"id": "174", "x": 832.0, "y": 90.0, "w": 242.7, "h": 229.0}, {"id": "176", "x": 1048.7, "y": 343.7, "w": 111.0, "h": 94.3}, {"id": "175", "x": 636.7, "y": 634.7, "w": 94.7, "h": 183.0}, {"id": "181", "x": 1120.0, "y": 633.3, "w": 99.7, "h": 177.3}, {"id": "173", "x": 1388.0, "y": 74.7, "w": 242.3, "h": 191.0}, {"id": "184", "x": 43.7, "y": 261.7, "w": 80.3, "h": 348.7}],
    path: "M542.285 90.3281L558.193 102.807L561.04 105.069L563.886 107.259L566.732 109.521L569.578 111.71L575.197 116.162L580.889 120.613L586.654 125.138L592.419 129.589L598.184 134.114L603.949 138.638L609.787 143.09L615.553 147.614L621.245 152.066L627.01 156.59L632.848 161.115L638.686 165.493L644.524 169.872L650.435 174.178L656.273 178.556L662.111 182.935L667.949 187.313L673.641 191.838L679.334 196.435L684.953 201.179L690.499 205.995L695.899 210.957L701.08 216.285L706.116 221.685L711.224 227.158L716.259 232.704L721.295 238.177L726.403 243.578L731.657 248.759L736.912 253.94L742.312 258.976L747.785 263.938L753.258 268.754L758.95 273.425L764.642 278.022L770.262 282.62L775.954 287.217L781.5 291.888L786.827 297.069L791.79 302.615L796.679 308.307L801.641 313.927L806.75 319.327L812.004 324.435L817.623 329.178L823.68 333.192L830.102 336.768L836.67 340.198L843.238 343.555L850.024 346.547L857.03 349.32L864.109 351.947L871.114 354.72L877.901 357.785L884.396 361.215L890.526 365.083L896.364 369.607L901.764 374.57L907.165 379.605L912.638 384.494L918.111 389.384L923.511 394.346L928.838 399.454L934.166 404.49L939.566 409.525L945.039 414.487L950.439 419.45L955.84 424.485L961.021 429.812L966.056 435.359L970.8 441.197L975.543 447.181L980.359 453.019L985.249 458.711L990.357 464.184L995.392 469.657L1000.57 475.057L1005.83 480.312L1011.23 485.274L1016.92 489.872L1023.12 493.812L1029.98 496.804L1037.5 498.775L1045.45 500.161L1053.48 501.548L1061.36 503.007L1069.24 504.467L1077.13 505.999L1085.01 507.532L1092.89 509.064L1100.62 510.743L1108.14 512.713L1115.22 515.34L1121.79 518.77L1127.99 522.638L1134.19 526.506L1140.47 530.227L1146.74 533.949L1153.09 537.671L1159.37 541.393L1165.72 545.114L1171.99 548.836L1178.2 552.631L1184.47 556.499L1190.68 560.439L1196.81 564.307L1202.94 568.321L1209.07 572.261L1215.2 576.275L1221.25 580.362L1227.31 584.375L1233.37 588.462L1239.35 592.622L1245.41 596.781L1251.39 600.868L1257.45 604.882L1263.51 608.968L1269.49 613.128L1275.47 617.288L1281.46 621.52L1287.3 625.826L1293.21 630.131L1298.97 634.583L1304.81 638.961L1310.58 643.413L1316.34 647.865L1322.11 652.462L1327.8 656.987L1333.56 661.511L1339.33 665.963L1345.24 670.268L1351.3 674.355L1357.43 678.369L1363.7 682.09L1370.05 685.739L1376.4 689.315L1379.54 691.139L1382.68 692.964L1385.89 694.642L1389.17 696.321L1408.66 705.151" },
  method: { canvas: [1292, 1029], bg: [403.5, 88.5, 871.0, 937.0], bubbles: [[16.0, 458.0, 432.5, 396.5], [260.5, 121.0, 432.5, 348.5], [702.5, 15.5, 446.0, 360.0]] },
  // bobble-head cats in the opening gang. z = depth (1 near … 9 far), X = -1 left wall … 1 right wall, hU = height in gang units
  // head = clip ellipse (cx, cy, rx, ry in % of image) and neck pivot (px, py in %)
  bobcats: [
    { img: 'route_cat_182', ar: 614/571, z: 1.75, X: -0.5,  hU: 0.62, flip: false, head: [81, 21, 19, 22, 80, 40], speed: 1.3 },
    { img: 'route_cat_174', ar: 728/687, z: 2.3,  X: 0.52,  hU: 0.6,  flip: true,  head: [77, 17, 15, 17, 77, 33], speed: 1.1 },
    { img: 'route_cat_180', ar: 302/607, z: 3.2,  X: -0.6,  hU: 0.6,  flip: false, head: [54, 15, 14, 17, 52, 30], speed: 1.5 },
    { img: 'route_cat_181', ar: 299/532, z: 4.0,  X: 0.28,  hU: 0.55, flip: false, head: [37, 27, 38, 28, 40, 52], speed: 1.2 },
    { img: 'route_cat_173', ar: 727/573, z: 6.0,  X: -0.2,  hU: 0.5,  flip: true,  head: [9, 12, 9, 13, 10, 24], speed: 0.9 }
  ]
};
