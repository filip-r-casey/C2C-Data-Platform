const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const axios = require("axios");
const path = require("path");
const { response: prevailing_response } = require("express");
const exp = require("constants");
const pgp = require("pg-promise")();
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const port = 3080;
console.log(__dirname);
const swaggerDocument = YAML.load(
  path.join(__dirname, "swagger", "swagger.yaml")
);
const {
  yearRange,
  spacedList,
  missingParameterMessage,
  isValidDate,
  parseAlaskaWindResponse,
  baselineTimeStep,
} = require(path.join(__dirname, "src", "scripts", "utilities"));
const {
  nasa_power_call,
  nasa_power_response_parse,
  nasa_power_error_parse,
  wind_toolkit_call,
  wind_toolkit_response_parse,
  wind_toolkit_error_parse,
  open_weather_call,
  open_weather_response_parse,
  nws_call,
  nws_station_response_parse,
  nws_rejected_check,
  nws_success_response_parse,
} = require(path.join(__dirname, "src", "scripts", "endpoints"));
const { stat } = require("fs");

const HOST = "0.0.0.0";
const credentials = {
  host: HOST,
  port: 5432,
  database: "root",
  user: "root",
  password: "root",
};
const db = pgp(credentials);

require("dotenv").config();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
// app.use(
//   "/static/scripts/",
//   express.static(path.join(__dirname, "/src/scripts"))
// );
app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use(express.static(process.cwd() + "/web-app/dist"));

// API
app.get("/", function (req, res) {
  res.send(process.cwd() + "/web-app/dist/index.html");
});

app.all("/api", function (req, res) {
  // Parameters: None
  // Returns: JSON
  res.status(200);
  res.json({
    message:
      "Welcome to the Communities to Clean API. For information on using this API, please address the documentation.",
  });
});

app.all("/api/search", function (req, res) {
  // Parameters: Latitude, Longitude, HubHeight, WindSurface, start, end, openWeather, timeStep
  // Returns: JSON
  if (req.method == "GET") {
    var req_path = "query";
  } else if (req.method == "POST") {
    var req_path = "body";
  } else {
    res.json({ error: "Incompatible method" });
  }
  var lat = req[req_path].Latitude;
  var lon = req[req_path].Longitude;
  var height = req[req_path].HubHeight;
  var wind_surface = req[req_path].WindSurface;
  var start_date = new Date(req[req_path].start).toISOString();
  var end_date = new Date(req[req_path].end).toISOString();
  var open_weather_bool = req[req_path].openWeather === "true";
  var time_step = req[req_path].timeStep;
  var format = req[req_path].format;
  var vertical_interpolation = req[req_path].VerticalInterpolation;
  var wsc_map = {
    vegtype_1: 0.7,
    vegtype_2: 0.75,
    vegtype_3: 0.75,
    vegtype_4: 0.75,
    vegtype_5: 0.5,
    vegtype_6: 0.3,
    vegtype_7: 1,
    vegtype_8: 0.5,
    vegtype_9: 0.1,
    vegtype_10: 0.5,
  };
  const surface_roughness = wsc_map[wind_surface];
  // NASA
  nasa_promise = nasa_power_call(
    lat,
    lon,
    height,
    wind_surface,
    start_date,
    end_date
  );

  wind_toolkit_promise = wind_toolkit_call(
    lat,
    lon,
    height,
    start_date,
    end_date
  );

  open_weather_promise = open_weather_call(
    lat,
    lon,
    height,
    start_date,
    end_date,
    time_step
  );

  var nws = axios.get(
    `http://0.0.0.0:3080/api/search/nws?Latitude=${lat}&Longitude=${lon}&start=${start_date}&end=${end_date}&HubHeight=${height}`
  );

  // //Alaska Energy Authority API
  // aea = axios.get(
  //   `http://0.0.0.0:3000/api/search/aea/wind_speed?lat=${lat}&lon=${lon}&height=${height}&start_date=${start_date}&end_date=${end_date}`
  // );

  // Find compatible sources
  var compatible_sources = {
    nasa: nasa_promise,
    ...((parseInt(start_date.slice(0, 3)) <= 2014 ||
      parseInt(end_date.slice(0, 3)) >= 2014) && {
      wind_toolkit: wind_toolkit_promise,
    }),
    nws: nws,
    ...(open_weather_bool && { open_weather: open_weather_promise }),
    // aea: aea,
  };

  // // console.log(
  // //   `http://0.0.0.0:3000/api/search/nasa_power?Latitude=${lat}&Longitude=${lon}&HubHeight=${height}&WindSurface=${wind_surface}&start=${start_date}&end=${end_date}`
  // // );
  // // console.log(
  // //   `http://0.0.0.0:3000/api/search/wind_toolkit?Latitude=${lat}&Longitude=${lon}&HubHeight=${height}&start=${start_date}&end=${end_date}`
  // // );
  // // console.log(
  // //   `http://0.0.0.0:3000/api/search/nws?Latitude=${lat}&Longitude=${lon}&start=${start_date}&end=${end_date}`
  // // );
  // // console.log(
  // //   `http://0.0.0.0:3000/api/search/aea/wind_speed?lat=${lat}&lon=${lon}&height=${height}&start_date=${start_date}&end_date=${end_date}`
  // // );

  // API Call
  if (Object.keys(compatible_sources).length > 0) {
    Promise.allSettled(
      Array.from(Object.values(compatible_sources)).flat()
    ).then((promise_responses) => {
      if ("nasa" in compatible_sources) {
        var nasa_idx = Object.keys(compatible_sources).indexOf("nasa");
        if (promise_responses[nasa_idx].status == "rejected") {
          var nasa_errors = nasa_power_error_parse(
            promise_responses[nasa_idx].reason
          );
        } else {
          var nasa_data = nasa_power_response_parse(
            promise_responses[nasa_idx].value
          )["response"];
        }
      }
      if ("wind_toolkit" in compatible_sources) {
        var wind_toolkit_idx =
          Object.keys(compatible_sources).indexOf("wind_toolkit");
        var wind_toolkit_data = promise_responses[wind_toolkit_idx];
        if (wind_toolkit_data.status == "rejected") {
          var wind_toolkit_errors = wind_toolkit_error_parse(
            promise_responses[wind_toolkit_idx].reason
          );
          wind_toolkit_data = null;
        } else {
          wind_toolkit_data = wind_toolkit_response_parse(
            promise_responses[wind_toolkit_idx].value
          );
        }
      }
      if ("open_weather" in compatible_sources) {
        var open_weather_idx =
          Object.keys(compatible_sources).indexOf("open_weather");
        var open_weather_data = Array.from(promise_responses).slice(
          open_weather_idx,
          open_weather_idx + time_step
        );
        open_weather_data = open_weather_response_parse(open_weather_data);
        if (open_weather_data.status != 200) {
          var open_weather_errors = open_weather_data.response;
          open_weather_data = null;
        } else {
          if (vertical_interpolation) {
          } else {
            open_weather_data = open_weather_data.response;
          }
        }
      }
      if ("nws" in compatible_sources) {
        var nasa_data_10 =
          promise_responses[Object.keys(compatible_sources).indexOf("nasa")]
            .value.data.parameters.WD10M;
        var nasa_data_50 =
          promise_responses[Object.keys(compatible_sources).indexOf("nasa")]
            .value.data.parameters.WD50M;
        for (timestamp in nasa_data_10) {
          (nasa_data_10[timestamp] * (height / nasa_data_50)) ^
            surface_roughness;
        }
        var nws_idx = Object.keys(compatible_sources).indexOf("nws");
        if (promise_responses[nws_idx].status == "rejected") {
          var nws_err = promise_responses[nws_idx].reason.response.data.errors;
        } else {
          var nws_data = promise_responses[nws_idx].value.data;
        }
      }
      if ("aea" in compatible_sources) {
        var aea_idx = Object.keys(compatible_sources).indexOf("aea");
        var aea_data = null;
        var aea_err = null;
        if (promise_responses[aea_idx].status == "rejected") {
          aea_err = promise_responses[aea_idx].reason.response.data.errors;
        } else {
          aea_data = promise_responses[aea_idx].value.data;
        }
      }
      if (format == "json") {
        json_response = {
          data_sources: {
            ...((nasa_data != null || nasa_errors != null) && {
              NASA: {
                ...(nasa_data != null && {
                  data: {
                    wind_speed: nasa_data.wind_speed,
                    wind_direction: nasa_data.wind_direction,
                  },
                }),
                ...(nasa_errors != null && { errors: nasa_errors }),
              },
            }),
            ...((wind_toolkit_data != null || wind_toolkit_errors != null) && {
              WIND: {
                ...(wind_toolkit_data != null && { data: wind_toolkit_data }),
                ...(wind_toolkit_errors != null && wind_toolkit_errors),
              },
            }),
            ...((open_weather_data != null || open_weather_errors != null) && {
              OPEN_WEATHER: {
                ...(open_weather_data != null && { data: open_weather_data }),
                ...(open_weather_errors != null && {
                  errors: open_weather_errors,
                }),
              },
            }),
            ...((nws_data != null || nws_err != null) && {
              NWS: {
                ...(nws_data != null && { data: nws_data }),
                ...(nws_err != null && { errors: nws_err }),
              },
            }),
            ...((aea_data != null || aea_data != null) && {
              AEA: {
                ...(aea_data != null && { data: aea_data }),
                ...(aea_err != null && { errors: aea_err }),
              },
            }),
          },
        };
        res.status(200);
        res.json(json_response);
      } else if (format == "csv") {
        function dateSort(a, b) {
          if (a[0] == b[0]) {
            return 0;
          } else {
            return a[0] < b[0] ? -1 : 1;
          }
        }
        var master_data = [];
        for (timestamp in nasa_data["wind_speed"]) {
          master_data.push([
            timestamp,
            nasa_data ? nasa_data["wind_speed"][timestamp] : -1,
            nasa_data ? nasa_data["wind_direction"][timestamp] : -1,
            -1,
            -1,
            -1,
            -1,
          ]);
        }
        for (timestamp in open_weather_data["wind_speed"]) {
          master_data.push([
            timestamp,
            -1,
            -1,
            -1,
            -1,
            open_weather_data ? open_weather_data["wind_speed"][timestamp] : -1,
            open_weather_data
              ? open_weather_data["wind_direction"][timestamp]
              : -1,
          ]);
          for (timestamp in Object.values(nws_data["stations"])[0][
            "wind_speed"
          ]) {
            master_data.push([
              timestamp,
              -1,
              -1,
              nws_data
                ? Object.values(nws_data["stations"])[0]["wind_speed"][
                    timestamp
                  ]
                : -1,
              nws_data
                ? Object.values(nws_data["stations"])[0]["wind_direction"][
                    timestamp
                  ]
                : -1,
              -1,
              -1,
            ]);
          }
        }
        master_data.sort(dateSort);
        const fields = [
          "timestamp",
          "NASA_POWER_WIND_SPEED",
          "NASA_POWER_WIND_DIRECTION",
          "NWS_WIND_SPEED",
          "NWS_WIND_DIRECTION",
          "OPEN_WEATHER_WIND_SPEED",
          "OPEN_WEATHER_WIND_DIRECTION",
        ];
        const arrayToCSV = (arr, delimiter = ",") =>
          arr.map((v) => v.map((x) => `"${x}"`).join(delimiter)).join("\n");
        master_data.unshift(fields);
        res.type("text/csv");
        res.status(200);
        res.send(arrayToCSV(master_data));
      }
    });
  } else {
    res.status(400);
    res.json({
      errors: [
        {
          status: 400,
          title: "No compatible sources",
          message:
            "Check requested parameters and ensure that they are compatible with at least one data source",
        },
      ],
    });
  }
});

app.get("/api/search/nasa_power", function (req, res) {
  if (req.method == "GET") {
    var req_path = "query";
  } else if (req.method == "POST") {
    var req_path = "body";
  } else {
    res.json({ error: "Incompatible method" });
  }
  var lat = req[req_path].Latitude;
  var lon = req[req_path].Longitude;
  var height = req[req_path].HubHeight;
  var wind_surface = req[req_path].WindSurface;
  var start_date = req[req_path].start;
  var end_date = req[req_path].end;
  params = {
    Latitude: lat,
    Longitude: lon,
    HubHeight: height,
    WindSurface: wind_surface,
    start: start_date,
    end: end_date,
  };
  if (!(lat && lon && height && wind_surface && start_date && end_date)) {
    missingParameterMessage(params, res, "/nasa_power");
    return;
  }
  var nasa_promise = nasa_power_call(
    lat,
    lon,
    height,
    wind_surface,
    start_date,
    end_date
  );
  if (nasa_promise) {
    nasa_promise
      .then((response) => {
        json_response = nasa_power_response_parse(response);
        res.status(json_response["status"]);
        res.json(json_response["response"]);
      })
      .catch((error) => {
        json_error = nasa_power_error_parse(error);
        res.status(json_error["status"]);
        res.json(json_error["response"]);
      });
  } else {
    return;
  }
});

app.get("/api/search/wind_toolkit", function (req, res) {
  if (req.method == "GET") {
    var req_path = "query";
  } else if (req.method == "POST") {
    var req_path = "body";
  } else {
    res.json({ error: "Incompatible method" });
  }
  var lat = req[req_path].Latitude;
  var lon = req[req_path].Longitude;
  var height = req[req_path].HubHeight;
  var start_date = req[req_path].start;
  var end_date = req[req_path].end;
  var params = {
    Latitude: lat,
    Longitude: lon,
    HubHeight: height,
    start: start_date,
    end: end_date,
  };
  if (!(lat && lon && height && start_date && end_date)) {
    missingParameterMessage(params, res, "/nasa_power");
    return;
  }

  if (isValidDate(new Date(start_date)) && isValidDate(new Date(start_date))) {
    if (lat > -90 && lat < 90 && lon > -180 && lon < 180) {
      var wind_toolkit = wind_toolkit_call(
        lat,
        lon,
        height,
        start_date,
        end_date
      );
    } else {
      res.status(400);
      res.json({
        errors: [
          {
            status: 400,
            title: "Coordinates out of range",
            detail:
              "Latitude must be within -90 and 90, and Longitude must be within -180 and 180",
          },
        ],
      });
    }
  } else {
    res.status(400);
    res.json({
      errors: [
        {
          status: 400,
          title: "Invalid Date",
          detail: "Date must be in the format YYYY-MM-DDT00:00:00Z",
        },
      ],
    });
    return;
  }
  wind_toolkit
    .then((wind_toolkit_response) => {
      json_response = wind_toolkit_response_parse(wind_toolkit_response);
      res.status(json_response["status"]);
      res.json(json_response["response"]);
    })
    .catch((wind_toolkit_error) => {
      json_error = wind_toolkit_error_parse(wind_toolkit_error);
      if (json_error["status"]) {
        res.status(json_error["status"]);
        res.json(json_error["response"]);
      } else {
        res.status(500);
        res.json(json_error["response"]);
      }
    });
});

app.get("/api/search/open_weather", function (req, res) {
  if (req.method == "GET") {
    var req_path = "query";
  } else if (req.method == "POST") {
    var req_path = "body";
  } else {
    res.json({ error: "Incompatible method" });
  }
  var lat = req[req_path].Latitude;
  var lon = req[req_path].Longitude;
  var height = req[req_path].HubHeight;
  var start_date = req[req_path].start;
  var end_date = req[req_path].end;
  var time_step = req[req_path].timeStep;
  const user_time_res = req[req_path].TimeResolution;
  const source_time_res =
    (new Date(end_date).getTime() - new Date(start_date).getTime()) /
    time_step /
    (1000 * 60);

  if (!(lat && lon && height && start_date && end_date && time_step)) {
    var params = {
      Latitude: lat,
      Longitude: lon,
      HubHeight: height,
      start: start_date,
      end: end_date,
      timeStep: time_step,
    };
    missingParameterMessage(params, res);
    return;
  }
  var open_weather_data = {};
  open_weather_requests = open_weather_call(
    lat,
    lon,
    height,
    start_date,
    end_date,
    time_step
  );
  if (open_weather_requests.length > 0) {
    Promise.allSettled(open_weather_requests).then((open_weather_response) => {
      var json_response = open_weather_response_parse(open_weather_response);
      res.status(json_response["status"]);
      if (user_time_res >= source_time_res || user_time_res == undefined) {
        res.json(json_response["response"]);
      } else {
        for (data_type of ["wind_speed", "wind_direction"]) {
          json_response["response"][data_type] = baselineTimeStep(
            json_response["response"][data_type],
            source_time_res,
            user_time_res
          );
        }
        res.json(json_response["response"]);
      }
    });
  }
});

// Alaska Energy Authority
app.get("/api/search/aea/sites/coord_search", (req, res) => {
  var lat = parseInt(req.query.lat);
  var lon = parseInt(req.query.lon);
  var lat_threshold = parseInt(req.query.lat_threshold);
  var lon_threshold = parseInt(req.query.lon_threshold);
  var site_response = {};

  db.any(
    "SELECT * FROM aea_sites WHERE (latitude BETWEEN $1 and $2) AND (longitude BETWEEN $3 AND $4)",
    [
      lat - lat_threshold,
      lat + lat_threshold,
      lon - lon_threshold,
      lon + lon_threshold,
    ]
  )
    .then((response) => {
      site_response = response;
      res.setHeader("Content-Type", "application/json");
      res.status(200);
      res.json({ sites: site_response });
    })
    .catch((error) => {
      res.status(404);
      res.json(error);
    });
});

app.get("/api/search/aea/sites/name_search", (req, res) => {
  var name = req.query.name;
  db.any("SELECT * FROM aea_sites WHERE site_name = $1", [name])
    .then((response) => {
      var site_response = response;
      res.setHeader("Content-Type", "application/json");
      res.status(200);
      res.json({ sites: site_response });
    })
    .catch((error) => {
      res.status(404);
      res.json(error);
    });
});

app.get("/api/search/aea/wind_speed", (req, res) => {
  if (req.query.sites == null && req.query.lat == null) {
    res.setHeader("Content-Type", "application/json");
    res.status(400);
    res.json({
      status: 400,
      title: "Insufficient request",
      message:
        "A request must include either a list of sites, or a location with latitude and longitude",
    });
  }
  if (req.query.sites != null) {
    var sites = req.query.sites.split(",");
  }
  var start = req.query.start;
  var end = req.query.end;
  var lat = parseInt(req.query.lat);
  var lon = parseInt(req.query.lon);
  var lat_threshold = parseInt(req.query.lat_threshold) || 1;
  var lon_threshold = parseInt(req.query.lon_threshold) || 1;

  if (sites == null && lat != null && lon != null) {
    // Condition to search for sites if they are not provided
    db.multi(
      `SELECT * FROM aea_sites
    INNER JOIN aea_prevailing_direction_data ON aea_sites.site_name = aea_prevailing_direction_data.site_name
    WHERE (latitude BETWEEN $1 and $2) AND (longitude BETWEEN $3 and $4);SELECT * FROM aea_sites
    INNER JOIN aea_historic_wind_data ON aea_sites.site_name = aea_historic_wind_data.site_name
    WHERE (latitude BETWEEN $1 and $2) AND (longitude BETWEEN $3 and $4);`,
      [
        lat - lat_threshold,
        lat + lat_threshold,
        lon - lon_threshold,
        lon + lon_threshold,
      ]
    )
      .then((responses) => {
        res.setHeader("Content-Type", "application/json");
        res.status(200);
        res.json({
          sites: parseAlaskaWindResponse(responses[0], responses[1]),
        });
      })
      .catch((error) => {
        console.error(error);
      });
  } else if (sites != null) {
    db.multi(
      `SELECT * FROM aea_sites INNER JOIN aea_prevailing_direction_data ON aea_sites.site_name = aea_prevailing_direction_data.site_name WHERE aea_sites.site_name IN ($1:list); SELECT * FROM aea_sites INNER JOIN aea_historic_wind_data ON aea_sites.site_name = aea_historic_wind_data.site_name WHERE aea_sites.site_name IN ($1:list);`,
      [sites]
    )
      .then((responses) => {
        res.setHeader("Content-Type", "application/json");
        res.status(200);
        res.json({
          sites: parseAlaskaWindResponse(responses[0], responses[1]),
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

app.all("/api/search/nws", function (req, res) {
  if (req.method == "GET") {
    var req_path = "query";
  } else if (req.method == "POST") {
    var req_path = "body";
  } else {
    res.json({ error: "Incompatible method" });
  }
  var lat = req[req_path].Latitude;
  var lon = req[req_path].Longitude;
  var height = req[req_path].HubHeight;
  const user_time_res = req[req_path].TimeResolution;
  const source_time_res = 60;
  if (req[req_path].start.charAt(req[req_path].start.length - 1) != "Z") {
    var start_date = req[req_path].start + "T00:00:00Z";
    var end_date = req[req_path].end + "T00:00:00Z";
  } else {
    var start_date = req[req_path].start;
    var end_date = req[req_path].end;
  }
  var params = {
    Latitude: lat,
    Longitude: lon,
    HubHeight: height,
    TimeRes: user_time_res,
    start: start_date,
    end: end_date,
  };
  if (!(lat && lon && height && start_date && end_date)) {
    missingParameterMessage(params, res, "/wind_speed");
    return;
  }
  var nws_promise = nws_call(lat, lon, height, start_date, end_date);
  var nws_wind_data = {};
  nws_promise
    .then((response) => {
      axios
        .get(response.data.properties.observationStations)
        .then((station_response) => {
          const [nws_stations_points, nws_stations] =
            nws_station_response_parse(station_response, start_date, end_date);
          Promise.allSettled(nws_stations).then((responses) => {
            var rejected_err = nws_rejected_check(responses);
            if (rejected_err) {
              res.type("application/vnd.api+json");
              res.status(400);
              res.json(rejected_err);
              return;
            }
            nws_wind_data = nws_success_response_parse(
              responses,
              nws_stations_points,
              lat,
              lon
            );
            if (nws_wind_data) {
              res.type("application/vnd.api+json");
              res.status(200);
              if (
                user_time_res <= source_time_res ||
                user_time_res == undefined
              ) {
                res.json({ stations: nws_wind_data });
              } else {
                for (station in nws_wind_data) {
                  for (data_type of ["wind_speed", "wind_direction"]) {
                    nws_wind_data[station][data_type] = baselineTimeStep(
                      nws_wind_data[station][data_type],
                      source_time_res,
                      user_time_res
                    );
                  }
                }
                res.json(nws_wind_data);
              }
            } else {
              res.type("application/vnd.api+json");
              res.status(404);
              var nws_response = {
                errors: [
                  {
                    status: 404,
                    title: "No Data Found",
                    detail:
                      "The National Weather Service does not have data for this time period",
                  },
                ],
              };
              res.json(nws_response);
            }
          });
        })
        .catch((station_error) => {
          res.type("application/vnd.api+json");
          res.status(404);
          res.json(station_error);
        });
    })
    .catch((error) => {
      nws_response = {
        errors: [
          {
            status: 404,
            title: error.response.data.title,
            detail: error.response.data.detail,
          },
        ],
      };
      res.type("application/vnd.api+json");
      res.status(404).json(nws_response);
    });
});

if (process.env.NODE_ENV !== "test") {
  const server = app.listen(port, function () {
    console.log(`Server started on port ${port}`);
  });
}
module.exports = app;
