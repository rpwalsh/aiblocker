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
const STYLO_TABLE = [{"w":"the","h":17.832,"a":70.655,"sd":21.256,"z":2.485},{"w":"of","h":9.643,"a":33.371,"sd":12.22,"z":1.942},{"w":"a","h":7.999,"a":27.904,"sd":11.001,"z":1.809},{"w":"is","h":4.022,"a":14.114,"sd":8.212,"z":1.229},{"w":"was","h":0.107,"a":3.534,"sd":3.902,"z":0.878},{"w":"that","h":2.703,"a":11.284,"sd":6.39,"z":1.343},{"w":"their","h":0.3,"a":4.758,"sd":4.397,"z":1.014},{"w":"our","h":1.963,"a":2.685,"sd":3.404,"z":0.212},{"w":"i","h":0.181,"a":1.148,"sd":3.147,"z":0.307},{"w":"this","h":2.676,"a":5.543,"sd":3.99,"z":0.719},{"w":"these","h":0.737,"a":1.647,"sd":2.566,"z":0.355},{"w":"those","h":0.07,"a":0.509,"sd":1.365,"z":0.321},{"w":"would","h":0.013,"a":0.972,"sd":2.137,"z":0.448},{"w":"may","h":0.125,"a":0.505,"sd":1.456,"z":0.261},{"w":"then","h":0.289,"a":1.151,"sd":2.437,"z":0.354},{"w":"when","h":0.172,"a":1.776,"sd":2.431,"z":0.66},{"w":"while","h":0.324,"a":1.116,"sd":1.988,"z":0.398},{"w":"who","h":0,"a":3.25,"sd":2.492,"z":1.304},{"w":"how","h":0.074,"a":0.787,"sd":1.786,"z":0.399},{"w":"all","h":0.172,"a":1.543,"sd":2.325,"z":0.59},{"w":"any","h":0.192,"a":0.567,"sd":1.503,"z":0.25},{"w":"such","h":0.729,"a":1.568,"sd":2.198,"z":0.381},{"w":"another","h":0.035,"a":0.26,"sd":1.066,"z":0.211},{"w":"here","h":0.065,"a":0.445,"sd":1.827,"z":0.208},{"w":"under","h":0.1,"a":0.532,"sd":1.453,"z":0.297},{"w":"about","h":0.069,"a":2.064,"sd":2.523,"z":0.791},{"w":"between","h":0.316,"a":1.19,"sd":2.249,"z":0.388},{"w":"into","h":0.545,"a":1.947,"sd":2.636,"z":0.532},{"w":"through","h":0.254,"a":1.183,"sd":2.011,"z":0.462},{"w":"above","h":0.021,"a":0.143,"sd":0.989,"z":0.124},{"w":"also","h":0.545,"a":2.273,"sd":3.185,"z":0.543},{"w":"just","h":0,"a":0.61,"sd":1.472,"z":0.414},{"w":"#:","h":0.092,"a":0.261,"sd":0.74,"z":0.227},{"w":"#\"","h":0.027,"a":0.925,"sd":1.324,"z":0.678}];

if (typeof module !== "undefined" && module.exports) module.exports = { STYLO_TABLE };
