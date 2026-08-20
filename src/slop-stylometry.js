/*
 * Copyright (c) 2026 Ryan P. Walsh
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Noncommercial use is free; commercial use requires a separate
 * license from the author. See LICENSE.
 */

// Burrows-Delta stylometry reference table: per-1000-word frequencies of
// closed-class function words, human vs machine centroids with pooled
// stddev, mined from the RAID multi-generator corpus with per-domain
// sign consistency (topic words are excluded by construction). Published
// so any user can audit exactly what the detector measures.
const STYLO_TABLE = [{"w":"the","h":17.832,"a":80.293,"sd":21.921,"z":2.849},{"w":"of","h":9.643,"a":39.573,"sd":12.546,"z":2.386},{"w":"and","h":9.263,"a":33.285,"sd":10.836,"z":2.217},{"w":"a","h":7.999,"a":29.486,"sd":11.703,"z":1.836},{"w":"in","h":7.228,"a":20.98,"sd":8.784,"z":1.566},{"w":"is","h":4.022,"a":16.671,"sd":8.588,"z":1.473},{"w":"was","h":0.107,"a":3.855,"sd":4.306,"z":0.87},{"w":"that","h":2.703,"a":10.904,"sd":6.277,"z":1.306},{"w":"it","h":1.142,"a":5.576,"sd":5.013,"z":0.885},{"w":"he","h":0.015,"a":6.31,"sd":5.008,"z":1.257},{"w":"his","h":0,"a":6.392,"sd":5.283,"z":1.21},{"w":"they","h":0.284,"a":3.485,"sd":4.074,"z":0.786},{"w":"their","h":0.3,"a":4.683,"sd":4.472,"z":0.98},{"w":"i","h":0.181,"a":1.366,"sd":3.618,"z":0.328},{"w":"be","h":1.373,"a":4.289,"sd":4.589,"z":0.635},{"w":"this","h":2.676,"a":4.853,"sd":3.979,"z":0.547},{"w":"these","h":0.737,"a":1.707,"sd":2.475,"z":0.392},{"w":"those","h":0.07,"a":0.402,"sd":1.226,"z":0.271},{"w":"were","h":0.099,"a":1.239,"sd":2.698,"z":0.423},{"w":"has","h":0.807,"a":5.522,"sd":4.775,"z":0.988},{"w":"will","h":0.188,"a":2.873,"sd":3.732,"z":0.72},{"w":"would","h":0.013,"a":1.23,"sd":2.636,"z":0.462},{"w":"may","h":0.125,"a":0.656,"sd":1.589,"z":0.334},{"w":"if","h":0.221,"a":1.234,"sd":2.541,"z":0.399},{"w":"then","h":0.289,"a":1.276,"sd":2.564,"z":0.385},{"w":"who","h":0,"a":3.212,"sd":2.551,"z":1.259},{"w":"how","h":0.074,"a":0.582,"sd":1.513,"z":0.336},{"w":"all","h":0.172,"a":1.377,"sd":2.277,"z":0.529},{"w":"some","h":0.222,"a":1.106,"sd":2.321,"z":0.381},{"w":"such","h":0.729,"a":1.559,"sd":2.309,"z":0.359},{"w":"there","h":0.163,"a":0.997,"sd":1.953,"z":0.427},{"w":"here","h":0.065,"a":1.009,"sd":2.979,"z":0.317},{"w":"up","h":0.111,"a":1.187,"sd":1.946,"z":0.553},{"w":"under","h":0.1,"a":0.649,"sd":1.582,"z":0.347},{"w":"about","h":0.069,"a":2.118,"sd":2.519,"z":0.813},{"w":"between","h":0.316,"a":1.48,"sd":2.451,"z":0.475},{"w":"above","h":0.021,"a":0.142,"sd":0.928,"z":0.13},{"w":"also","h":0.545,"a":3.008,"sd":3.681,"z":0.669},{"w":"very","h":0.193,"a":0.853,"sd":2.442,"z":0.27},{"w":"just","h":0,"a":0.59,"sd":1.488,"z":0.397}];

if (typeof module !== "undefined" && module.exports) module.exports = { STYLO_TABLE };
