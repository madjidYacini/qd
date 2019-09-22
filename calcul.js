var csvjson = require("csvjson");
var fs = require("fs");
const fetch = require("node-fetch");
var _ = require("lodash");
var cities_insee = require("./cities.json");
var regions = require("./regions.json");

var options = {
  delimiter: ";", // optional
  quote: '"' // optional
};
var file_data = fs.readFileSync("./bornes-irve.csv", "utf-8");

let indexFalseData = [];
let indexUsableData = [];
var result = csvjson.toObject(file_data, options);

let cptCorrecte = 0;
let cptUtilisable = 0;
let cptIncorrecte = 0;
result.forEach((oneData, index) => {
  let boolResult = [];
  let boolResultFinish = [];
  boolResult.push(checkXlongitude(oneData, index));
  boolResult.push(checkYlatitude(oneData, index));
  boolResult.push(pussance_max(oneData, index));
  boolResult.push(checkDatamaj(oneData, index));
  boolResult.push(checkAccessibility(oneData, index));
  boolResult.push(checkTypeDePrise(oneData, index));

  boolResult.push(checkCode_insee(oneData, index));

  boolResult.push(checkN_amenageur(oneData, index));
  boolResult.push(checkN_enseigne(oneData, index));
  boolResult.push(checkId_station(oneData, index));
  boolResult.push(check_id_pdc(oneData, index));
  boolResult.push(checkNbre_pdc(oneData, index));
  boolResult.push(checkN_operateur(oneData, index));
  boolResult.push(checkAdressStation(oneData, index));
  boolResult.push(checkSource(oneData, index));
  boolResult.push(check_geo_borne(oneData, index));
  boolResult.push(checkCode_insee_commune(oneData, index));
  boolResult.push(checkRegion(oneData, index));
  boolResult.push(check_acces_recharge(oneData, index));
  boolResult.push(checkNomStation(oneData, index));
  boolResult.push(checkObservasion(oneData, index));

  Promise.all(boolResult).then(value => {
    if (value.includes(1) && !value.includes(2) && !value.includes(3)) {
      cptCorrecte++;
    }
    let principalValue = value.slice(0, 6);
    console.log("====================================");
    console.log(principalValue);
    console.log("====================================");
    if (!principalValue.includes(3)) {
      cptUtilisable++;
    }
    if (principalValue.includes(3)) {
      cptIncorrecte++;
    }
  });
});
setTimeout(() => {
  console.log("====================================");
  console.log("enregistrement correcte : " + (cptCorrecte * 100) / 299 + "%");
  console.log("====================================");
  console.log("====================================");
  console.log(
    "enregistrement utilisable : " + (cptUtilisable * 100) / 299 + "%"
  );
  console.log(
    "enregistrement incorrecte mais utilisable : " +
      ((cptUtilisable - cptCorrecte) * 100) / 299 +
      "%"
  );
  console.log("====================================");
  console.log("====================================");
  console.log(
    "enregistrement inutilisable : " + (cptIncorrecte * 100) / 299 + "%"
  );
  console.log("====================================");
}, 5000);
function checkXlongitude(data, index) {
  if (data.hasOwnProperty("Xlongitude")) {
    if (
      (data.Xlongitude >= 180 && data.Xlongitude <= -180) ||
      isNaN(data.Xlongitude) ||
      data.Xlongitude === ""
    ) {
      return 3;
    }
    return 1;
  }
}
function checkYlatitude(data, index) {
  if (data.hasOwnProperty("Ylatitude")) {
    if (
      (data.Ylatitude >= 90 && data.Ylatitude <= -90) ||
      isNaN(data.Ylatitude) ||
      data.Ylatitude === ""
    ) {
      return 3;
    }
    return 1;
  }
}

function pussance_max(data, index) {
  if (data.hasOwnProperty("puiss_max")) {
    let regex = /^[0-9]*(,|\.){1}[0-9]*( )?(kW|kva)?$/;
    if (data.puiss_max === " ") {
      return 3;
    } else if (data.puiss_max.match(regex) !== null) {
      return 2;
    }
    return 1;
  }
}
function checkDatamaj(data, index) {
  let regex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i;
  if (data.hasOwnProperty("date_maj")) {
    if (data.date_maj === " ") {
      return 3;
    } else if (data.date_maj.match(regex) === null) {
      return 2;
    }
    return 1;
  }
}

function checkTypeDePrise(data, index) {
  let regex = /^([T1|T2|T3|T4|T5|CHAdeMO|COMBO(E\/F)]{1}( - ){0,1})*$/;
  if (data.type_prise === "") {
    return 3;
  } else if (data.type_prise.match(regex) === null) {
    return 2;
  }
  return 1;
}

async function checkAccessibility(data, index) {
  let regex = /^[0-9]{1,2}h\/24 [0-9]{1}j\/7$/; //ex : 24h/24 7j/7

  if (data.accessibilité === "" || data.accessibilité === "Accès libre") {
    return 3;
  }
  return 1;
}
function checkN_amenageur(data, index) {
  if (data.hasOwnProperty("n_amenageur")) {
    if (data.n_amenageur === "") {
      return 2;
    }
    return 1;
  }
}
function checkN_operateur(data, index) {
  if (data.hasOwnProperty("n_operateur")) {
    if (data.n_operateur === "") {
      return 2;
    }
    return 1;
  }
}

function checkN_enseigne(data, index) {
  if (data.hasOwnProperty("n_enseigne")) {
    if (data.n_enseigne === "") {
      return 2;
    }
    return 1;
  }
}
function checkId_station(data, index) {
  if (data.hasOwnProperty("id_station")) {
    if (!data.id_station.includes("FR*")) {
      return 2;
    }
    return 1;
  }
}
function check_id_pdc(data, index) {
  if (data.hasOwnProperty("id_pdc")) {
    if (!data.id_pdc.includes("FR*")) {
      return 2;
    }
    return 1;
  }
}
function checkCode_insee(data, index) {
  let regex = /^\d{1,2}( )?\d{3}$/;
  if (data.hasOwnProperty("code_insee")) {
    let inseeCheck = _.find(cities_insee, {
      insee_code: data.code_insee
    });
    if (inseeCheck === undefined) {
      return 3;
    }
    return 1;
  }
}
function checkNbre_pdc(data, index) {
  if (data.hasOwnProperty("nbre_pdc")) {
    if (isNaN(data.nbre_pdc) || data.nbre_pdc === "") {
      return 3;
    }
    return 1;
  }
}

function checkDatamaj(data, index) {
  let regex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i;
  if (data.hasOwnProperty("date_maj")) {
    if (data.date_maj === "") {
      return 3;
    } else if (data.date_maj.match(regex) === null) {
      return 2;
    }
    return 1;
  }
}
async function checkSource(data, index) {
  let regex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
  if (data.hasOwnProperty("source")) {
    if (data.source === "") {
      return 2;
    } else if (data.source.match(regex) === null) {
      return 2;
    } else {
      try {
        let response = await fetch(data.source);
        if (response.status === 404) {
          return 2;
        }
        return 1;
      } catch (error) {
        console.log(error);
      }
    }
  }
}

async function check_geo_borne(data, index) {
  if (data.hasOwnProperty("geo_point_borne")) {
    if (data.geo_point_borne === "") {
      return 2;
    } else {
      let latitudeLongitude = data.geo_point_borne.split(",");
      if (
        (latitudeLongitude[0] >= 90 && latitudeLongitude[0] <= -90) ||
        isNaN(latitudeLongitude[0])
      ) {
        return 2;
      } else if (
        (latitudeLongitude[1] >= 180 && latitudeLongitude[1] <= -180) ||
        isNaN(latitudeLongitude[1])
      ) {
        return 2;
      } else if (
        latitudeLongitude[0] !== data.Ylatitude &&
        latitudeLongitude[1] !== data.Xlongitude
      ) {
        return 2;
      }
      return 1;
    }
  }
}

async function checkCode_insee_commune(data, index) {
  let inseeCheck = _.find(cities_insee, {
    insee_code: data.code_insee_commune
  });
  if (inseeCheck === undefined) {
    return 3;
  }
  return 1;
}

function checkRegion(data, index) {
  let regioncheck = _.find(regions, {
    name: data.Région
  });
  if (regioncheck === undefined) {
    return 2;
  }
  return 1;
}

function check_acces_recharge(data, index) {
  if (data.acces_recharge === "") {
    return 2;
  }
  return 1;
}

async function checkObservasion(data, index) {
  if (data.observations === "") {
    return 2;
  }
  return 1;
}

async function checkNomStation(data, index) {
  if (data.n_station === "") {
    return 3;
  }
  return 1;
}

function checkAdressStation(data, index) {
  let regex = /^([0-9]+) ([a-zA-Z'àâéèêôùûçÀÂÉÈÔÙÛÇ\s-]+) ([0-9]{5} ([a-zA-Z 'àâéèêôùûçÀÂÉÈÔÙÛÇ-]+))$/;

  if (data.ad_station === "") {
    return 3;
  }
  return 1;
}
