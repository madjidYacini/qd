var csvjson = require("csvjson");
var fs = require("fs");
const fetch = require("node-fetch");

var options = {
  delimiter: ";", // optional
  quote: '"' // optional
};
var file_data = fs.readFileSync("./bornes-irve.csv", "utf-8");
let indexFalseData = [];
let indexUsableData = [];
var result = csvjson.toObject(file_data, options);
result.forEach((oneData, index) => {
  checkXlongitudeYlatitude(oneData, index);
  pussance_max(oneData, index);
  checkN_amenageur(oneData, index);
  checkN_enseigne(oneData, index);
  checkId_station_idPdc(oneData, index);
  checkCode_insee(oneData, index);
  checkNbre_pdc(oneData, index);
  checkN_operateur(oneData, index);
  checkDatamaj(oneData, index);
  // checkSource(oneData, index);
  check_geo_borne(oneData, index);
});
console.log(indexUsableData.length, indexFalseData.length);
setTimeout(() => {
  console.log("====================================");
  console.log(indexUsableData.length, indexFalseData.length);
  console.log("====================================");
}, 10000);
async function checkXlongitudeYlatitude(data, index) {
  if (data.hasOwnProperty("Xlongitude")) {
    if (
      (data.Xlongitude >= 180 && data.Xlongitude <= -180) ||
      isNaN(data.Xlongitude) ||
      data.Xlongitude === ""
    ) {
      if (indexFalseData.includes(data) === false) {
        indexFalseData.push(index);
      }
    }
  }
  if (data.hasOwnProperty("Ylatitude")) {
    if (
      (data.Ylatitude >= 90 && data.Ylatitude <= -90) ||
      isNaN(data.Ylatitude) ||
      data.Ylatitude === ""
    ) {
      if (indexFalseData.includes(index) === false) {
        indexFalseData.push(index);
      }
    }
  }
}

async function pussance_max(data, index) {
  if (data.hasOwnProperty("puiss_max")) {
    let regex = /^[0-9]*(,|\.){1}[0-9]*( )?(kW|kva)?$/;
    if (data.puiss_max === "") {
      if (!indexFalseData.includes(index)) {
        indexFalseData.push(data);
      }
    } else if (data.puiss_max.match(regex) !== null) {
      if (!indexUsableData.includes(index)) {
        indexUsableData.push(index);
      }
    }
  }
}
async function checkN_amenageur(data, index) {
  if (data.hasOwnProperty("n_amenageur")) {
    if (data.n_amenageur === "") {
      if (!indexFalseData.includes(index)) {
        indexFalseData.push(index);
      }
    }
  }
}
async function checkN_operateur(data, index) {
  if (data.hasOwnProperty("n_operateur")) {
    if (data.n_operateur === "") {
      if (!indexFalseData.includes(index)) {
        indexFalseData.push(index);
      }
    }
  }
}

async function checkN_enseigne(data, index) {
  if (data.hasOwnProperty("n_enseigne")) {
    if (data.n_enseigne === "") {
      if (!indexFalseData.includes(index)) {
        indexFalseData.push(index);
      }
    }
  }
}
async function checkId_station_idPdc(data, index) {
  if (data.hasOwnProperty("id_station")) {
    if (!data.id_station.includes("FR*")) {
      if (!indexUsableData.includes(index)) {
        indexUsableData.push(index);
      }
    }
  }
  if (data.hasOwnProperty("id_pdc")) {
    if (!data.id_pdc.includes("FR*")) {
      if (!indexUsableData.includes(index)) {
        indexUsableData.push(index);
      }
    }
  }
}
async function checkCode_insee(data, index) {
  let regex = /^\d{1,2}( )?\d{3}$/;
  if (data.hasOwnProperty("code_insee")) {
    if (data.code_insee.match(regex) === null) {
      if (!indexUsableData.includes(index)) {
        indexUsableData.push(index);
      }
    }
  }
}
async function checkNbre_pdc(data, index) {
  if (data.hasOwnProperty("nbre_pdc")) {
    if (isNaN(data.nbre_pdc) || data.nbre_pdc === "") {
      if (!indexUsableData.includes(index)) {
        indexUsableData.push(index);
      }
    }
  }
}

async function checkDatamaj(data, index) {
  let regex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i;
  if (data.hasOwnProperty("date_maj")) {
    if (data.date_maj === "") {
      if (!indexFalseData.includes(index)) {
        indexFalseData.push(index);
      }
    } else if (data.date_maj.match(regex) === null) {
      if (!indexUsableData.includes(index)) {
        indexUsableData.push(index);
      }
    }
  }
}
async function checkSource(data, index) {
  let regex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
  if (data.hasOwnProperty("source")) {
    if (data.source === "") {
      if (!indexUsableData.includes(index)) {
        indexUsableData.push(index);
      }
    } else if (data.source.match(regex) === null) {
      console.log(index);

      if (!indexUsableData.includes(index)) {
        indexUsableData.push(index);
      }
    } else {
      try {
        let response = await fetch(data.source);
        if (response.status === 404) {
          console.log(data.source, index);

          if (!indexUsableData.includes(index)) {
            indexUsableData.push(index);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}

async function check_geo_borne(data, index) {
  if (data.hasOwnProperty("geo_point_borne")) {
    if (data.geo_point_borne === "") {
      if (!indexUsableData.includes(index)) {
        indexUsableData.push(index);
      }
    } else {
      let latitudeLongitude = data.geo_point_borne.split(",");
      console.log(latitudeLongitude);
      if (
        (latitudeLongitude[0] >= 90 && latitudeLongitude[0] <= -90) ||
        isNaN(latitudeLongitude[0])
      ) {
        if (!indexUsableData.includes(index)) {
          indexUsableData.push(index);
        }
      } else if (
        (latitudeLongitude[1] >= 180 && latitudeLongitude[1] <= -180) ||
        isNaN(latitudeLongitude[1])
      ) {
        if (!indexUsableData.includes(index)) {
          indexUsableData.push(index);
        }
      } else if (
        latitudeLongitude[0] !== data.Ylatitude &&
        latitudeLongitude[1] !== data.Xlongitude
      ) {
        if (!indexUsableData.includes(index)) {
          indexUsableData.push(index);
        }
      }
    }
  }
}
