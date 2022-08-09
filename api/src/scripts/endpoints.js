const axios = require("axios");
const { json } = require("body-parser");
const { spacedList, yearRange, isValidDate } = require("./utilities");
function nasa_power_call(lat, lon, height, wind_surface, start_date, end_date) {
  json_response = {};
  var formatted_start_date =
    start_date.slice(0, 4) + start_date.slice(5, 7) + start_date.slice(8, 10);
  var formatted_end_date =
    end_date.slice(0, 4) + end_date.slice(5, 7) + end_date.slice(8, 10);
  if (height < 30) {
    // Sets keyword based on where the height is closest to
    var param = "WD50M";
  } else if (height < 6) {
    var param = "WD10M";
  } else {
    var param = "WD2M";
  }
  var nasa = axios.get(
    `https://power.larc.nasa.gov/api/temporal/hourly/point?community=RE&parameters=${param},WSC&latitude=${lat}&longitude=${lon}&start=${formatted_start_date}&end=${formatted_end_date}&format=JSON&wind-elevation=${height}&wind-surface=${wind_surface}`
  );
  return nasa;
}
function nasa_power_response_parse(nasa_response) {
  var nasa_speed = {};
  var nasa_direction = {};
  nasa_data = nasa_response.data.properties.parameter;
  param = Array.from(Object.keys(nasa_data)).filter((item) => item != "WSC")[0];
  console.log(param);
  for (const [key, value] of Object.entries(nasa_data.WSC)) {
    nasa_speed[
      new Date(
        parseInt(key.slice(0, 4)),
        parseInt(key.slice(4, 6)) - 1,
        parseInt(key.slice(6, 8)),
        parseInt(key.slice(8, 10))
      ).toISOString()
    ] = value;
    nasa_direction[
      new Date(
        parseInt(key.slice(0, 4)),
        parseInt(key.slice(4, 6)) - 1,
        parseInt(key.slice(6, 8)),
        parseInt(key.slice(8, 10))
      ).toISOString()
    ] = nasa_data[param][key];
  }
  json_response["status"] = 200;
  json_response["response"] = {
    wind_speed: nasa_speed,
    wind_direction: nasa_direction,
  };
  return json_response;
}
function nasa_power_error_parse(nasa_error) {
  var title_str = "";
  var detail_str = "";
  if ("detail" in nasa_error.response.data) {
    // Checks for an error with the date string
    title_str = nasa_error.response.data.detail[0].msg;
    detail_str = "Invalid value at: ";
    for (let i = 0; i < nasa_error.response.data.detail[0].loc.length; i++) {
      detail_str += nasa_error.response.data.detail[0].loc[i] + ", ";
    }
    detail_str = detail_str.substring(0, detail_str.length - 2);
  } else {
    title_str = nasa_error.response.data.header;
    if (nasa_error.response.data.message) {
      detail_str = nasa_error.response.data.message;
    } else {
      for (let i = 0; i < nasa_error.response.data.messages.length; i++) {
        detail_str += nasa_error.response.data.messages[i] + " ";
      }
    }
  }
  json_response["status"] = nasa_error.response.status;
  json_response["response"] = {
    errors: [
      {
        status: nasa_error.response.status,
        title: title_str,
        detail: detail_str,
      },
    ],
  };
  return json_response;
}
function wind_toolkit_call(lat, lon, height, start_date, end_date) {
  json_response = {};
  var begin_year = new Date(start_date).getFullYear();
  var end_year = new Date(end_date).getFullYear();
  var heights = [10, 40, 60, 80, 100, 120, 140, 160, 200];
  var closest = heights.reduce((prev, curr) => {
    return Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev;
  });
  return axios.get(
    `https://developer.nrel.gov/api/wind-toolkit/v2/wind/wtk-download.json?api_key=${
      process.env.WIND_TOOLKIT_API_KEY
    }&wkt=POINT(${lon} ${lat})&attributes=windspeed_${closest}m,winddirection_${closest}m&names=${spacedList(
      yearRange(begin_year, end_year)
    )}&email=${process.env.EMAIL}`
  );
}
function wind_toolkit_response_parse(wind_toolkit_response) {
  var json_response = {};
  json_response = {
    url: wind_toolkit_response.data.outputs.downloadUrl,
  };
  return json_response;
}
function wind_toolkit_error_parse(wind_toolkit_error) {
  var json_error = {};
  if (
    !("errors" in wind_toolkit_error.response.data) &&
    wind_toolkit_error.response.data.error.code == "OVER_RATE_LIMIT"
  ) {
    json_error = {
      errors: [
        {
          status: wind_toolkit_error.response.data.status,
          title: "Exceeded Rate Limit",
          detail: wind_toolkit_error.response.data.error.message,
        },
      ],
    };
  } else {
    json_error = {
      errors: [
        {
          status: wind_toolkit_error.response.data.status,
          title: "Wind Toolkit Error",
          detail: wind_toolkit_error.response.data.errors[0],
        },
      ],
    };
  }
  return json_error;
}
function open_weather_call(lat, lon, height, start_date, end_date, time_step) {
  var first_date = new Date(start_date).getTime();
  var last_date = new Date(end_date).getTime();
  var diffTime = Math.abs(last_date - first_date);
  var increment_time = diffTime / time_step;
  var open_weather_requests = [];
  for (var i = first_date; i < last_date; i += increment_time) {
    open_weather_requests.push(
      axios.get(
        `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${Math.floor(
          i / 1000
        )}&appid=${process.env.OPEN_WEATHER_API_KEY}`
      )
    );
  }
  return open_weather_requests;
}
function open_weather_response_parse(open_weather_response) {
  var open_weather_responses = [];
  var open_weather_errors = [];
  var open_weather_data = {};
  for (var i = 0; i < open_weather_response.length; i++) {
    if (open_weather_response[i].status == "fulfilled") {
      open_weather_responses.push(open_weather_response[i]);
    } else {
      open_weather_errors.push(open_weather_response[i]);
    }
  }
  if (open_weather_errors.length <= 0) {
    open_weather_errors = null;
  }
  open_weather_data["wind_speed"] = {};
  open_weather_data["wind_direction"] = {};
  for (var i = 0; i < open_weather_responses.length; i++) {
    open_weather_data["wind_speed"][
      new Date(
        open_weather_responses[i].value.data.data[0].dt * 1000
      ).toISOString()
    ] = open_weather_responses[i].value.data.data[0].wind_speed;
    open_weather_data["wind_direction"][
      new Date(
        open_weather_responses[i].value.data.data[0].dt * 1000
      ).toISOString()
    ] = open_weather_responses[i].value.data.data[0].wind_deg;
  }
  var json_response = {};
  if (open_weather_errors) {
    json_response["status"] = open_weather_errors[0].reason.response.status;
    json_response["response"] = {
      errors: [
        {
          status: open_weather_errors[0].reason.response.status,
          title: open_weather_errors[0].reason.response.statusText,
          detail: open_weather_errors[0].reason.response.data.message,
        },
      ],
    };
  } else {
    json_response["status"] = 200;
    json_response["response"] = open_weather_data;
  }
  return json_response;
}
function nws_call(lat, lon, height, start, end) {
  json_response = {};
  return axios.get(`https://api.weather.gov/points/${lat},${lon}`);
}
function nws_station_response_parse(station_response, start, end) {
  var nws_stations_points = {};
  var nws_stations = [];
  for (var i = 0; i < station_response.data.observationStations.length; i++) {
    nws_stations_points[
      station_response.data.features[i].properties.stationIdentifier
    ] = station_response.data.features[i].geometry.coordinates.reverse();
    var promise = axios.get(
      `${station_response.data.observationStations[i]}/observations?start=${start}&end=${end}`
    );
    nws_stations.push(promise);
  }
  return [nws_stations_points, nws_stations];
}
function nws_rejected_check(responses) {
  for (let i = 0; i < responses.length; i++) {
    if (responses[i].status == "rejected") {
      var error_response = {
        errors: [
          {
            status: 400,
            title: responses[i].reason.response.title,
            detail: {
              parameterErrors:
                responses[i].reason.response.data.parameterErrors,
            },
          },
        ],
      };
      return error_response;
    }
  }
  return null;
}
function nws_success_response_parse(responses, nws_stations_points, lat, lon) {
  var nws_wind_data = {};
  var data_modified = false;
  for (let i = 0; i < responses.length; i++) {
    if (responses[i].value.data.features.length > 0) {
      data_modified = true;
      nws_wind_data[responses[i].value.data.features[0].properties.station] =
        {};
      nws_wind_data[responses[i].value.data.features[0].properties.station][
        "wind_speed"
      ] = {};
      nws_wind_data[responses[i].value.data.features[0].properties.station][
        "wind_direction"
      ] = {};
      nws_wind_data[responses[i].value.data.features[0].properties.station][
        "proximity"
      ] = [
        lat -
          nws_stations_points[
            responses[i].value.data.features[0].properties.station.slice(
              responses[
                i
              ].value.data.features[0].properties.station.lastIndexOf("/") + 1
            )
          ][0],
        lon -
          nws_stations_points[
            responses[i].value.data.features[0].properties.station.slice(
              responses[
                i
              ].value.data.features[0].properties.station.lastIndexOf("/") + 1
            )
          ][1],
      ];
    }
    for (let j = 0; j < responses[i].value.data.features.length; j++) {
      const nws_wind_direction =
        responses[i].value.data.features[j].properties.windDirection.value;
      const nws_wind_speed =
        responses[i].value.data.features[j].properties.windSpeed.value;
      nws_wind_data[responses[i].value.data.features[j].properties.station][
        "wind_speed"
      ][
        new Date(
          responses[i].value.data.features[j].properties.timestamp
        ).toISOString()
      ] = nws_wind_speed;
      nws_wind_data[responses[i].value.data.features[j].properties.station][
        "wind_direction"
      ][
        new Date(
          responses[i].value.data.features[j].properties.timestamp
        ).toISOString()
      ] = nws_wind_direction;
    }
  }
  if (data_modified) {
    return nws_wind_data;
  } else {
    return null;
  }
}
module.exports = {
  nasa_power_call: nasa_power_call,
  nasa_power_response_parse: nasa_power_response_parse,
  nasa_power_error_parse: nasa_power_error_parse,
  wind_toolkit_call: wind_toolkit_call,
  wind_toolkit_response_parse: wind_toolkit_response_parse,
  wind_toolkit_error_parse: wind_toolkit_error_parse,
  open_weather_call: open_weather_call,
  open_weather_response_parse: open_weather_response_parse,
  nws_call: nws_call,
  nws_station_response_parse: nws_station_response_parse,
  nws_rejected_check: nws_rejected_check,
  nws_success_response_parse: nws_success_response_parse,
};
