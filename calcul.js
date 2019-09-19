var csvjson = require("csvjson");
var fs = require("fs");
var options = {
  delimiter: ";", // optional
  quote: '"' // optional
};
var file_data = fs.readFileSync("./bornes-irve.csv", "utf-8");
let indexFalseData = [];
let indexUsableData = [];
let indexUnusableData = [];
let t = 0;
var result = csvjson.toObject(file_data, options);
result.forEach((oneData, index) => {
  checkXlongitudeYlatitude(oneData, index);
  pussance_max(oneData, index);
  checkN_amenageur(oneData, index);
  checkN_enseigne(oneData, index);
  checkId_station_idPdc(oneData, index);
  checkCode_insee(oneData, index);
  checkNbre_pdc(oneData, index);
});
console.log("====================================");
console.log(indexUsableData.length, indexFalseData);
console.log(result[1].id_station.includes("FR*"));

console.log("====================================");
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
    let regex = /^(\d)(,)?(\d)?( )?(kW|kva){1}$/;
    if (data.puiss_max === "") {
      if (!indexFalseData.includes(index)) {
        indexFalseData.push(data);
      }
    } else if (data.puiss_max.match(regex) !== null) {
      if (!indexUnusableData.includes(index)) {
        indexUnusableData.push(index);
      }
    }
  }
}
async function checkN_amenageur(data, index) {
  if (data.hasOwnProperty("n_amenageur")) {
    if (data.n_amenageur === "") {
      if (!indexUsableData.includes(index)) {
        indexUsableData.push(index);
      }
    }
  }
}
async function checkN_operateur(data, index) {
  if (data.hasOwnProperty("n_operateur")) {
    if (data.n_operateur === "") {
      indexUsableData.push(index);
    }
  }
}

async function checkN_enseigne(data, index) {
  if (data.hasOwnProperty("n_enseigne")) {
    if (data.n_enseigne === "") {
      if (!indexUsableData.includes(index)) {
        indexUsableData.push(index);
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
