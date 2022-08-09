function yearRange(start_year, end_year) {
  var years = [];
  while (start_year <= end_year) {
    years.push(start_year++);
  }
  return years;
}

function spacedList(array) {
  var spaced_string = "";
  for (var i = 0; i < array.length; i++) {
    spaced_string += array[i] + ",";
  }
  return spaced_string.trim();
}

function missingParameterMessage(params, res, endpoint_name) {
  var missing_params = [];
  for (const [key, value] of Object.entries(params)) {
    if (value == null) {
      missing_params.push(key);
    }
  }
  if (missing_params.length == Object.keys(params).length) {
    res.status(200);
    res.json({
      message: `Welcome to the C2C ${endpoint_name} endpoint. For information on using this endpoint, please address the documentation.`,
    });
  } else {
    res.status(400);
    res.json({
      errors: [
        {
          status: 400,
          title: "Missing parameters",
          detail: `Missing ${missing_params}`,
        },
      ],
    });
  }
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}
function parseAlaskaWindResponse(prevailing_response, historic_response) {
  var response_json = {};
  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  for (let i = 0; i < prevailing_response.length; i++) {
    if (!(prevailing_response[i]["site_name"] in response_json)) {
      response_json[prevailing_response[i]["site_name"]] = {
        latitude: prevailing_response[i]["latitude"],
        longitude: prevailing_response[i]["longitude"],
        elevation: prevailing_response[i]["elevation"],
        altitude: prevailing_response[i]["altitude"],
        prevailing_data: {
          prevailing_direction: {
            January: {},
            February: {},
            March: {},
            April: {},
            May: {},
            June: {},
            July: {},
            August: {},
            September: {},
            October: {},
            November: {},
            December: {},
          },
          speed_for_prevailing: {
            January: {},
            February: {},
            March: {},
            April: {},
            May: {},
            June: {},
            July: {},
            August: {},
            September: {},
            October: {},
            November: {},
            December: {},
          },
        },
      };
    } else {
      response_json[prevailing_response[i]["site_name"]]["prevailing_data"][
        "prevailing_direction"
      ][months[prevailing_response[i]["month"] - 1]][
        prevailing_response[i]["hour"]
      ] = prevailing_response[i]["prevailing_direction"];
      response_json[prevailing_response[i]["site_name"]]["prevailing_data"][
        "speed_for_prevailing"
      ][months[prevailing_response[i]["month"] - 1]][
        prevailing_response[i]["hour"]
      ] = prevailing_response[i]["speed_for_prevailing"];
    }
  }
  for (let i = 0; i < historic_response.length; i++) {
    if (
      !("historic_data" in response_json[historic_response[i]["site_name"]])
    ) {
      response_json[historic_response[i]["site_name"]]["historic_data"] = {
        wind_speed: {},
      };
    }
    if (
      !(
        historic_response[i].year in
        response_json[historic_response[i]["site_name"]]["historic_data"][
          "wind_speed"
        ]
      )
    ) {
      response_json[historic_response[i]["site_name"]]["historic_data"][
        "wind_speed"
      ][historic_response[i].year] = {};
    }
    response_json[historic_response[i]["site_name"]]["historic_data"][
      "wind_speed"
    ][historic_response[i].year][months[historic_response[i].month - 1]] =
      historic_response[i].wind_speed;
  }
  return response_json;
}
function baselineTimeStep(data, source_time_res, user_time_res) {
  var interpolated_data = {};
  const date_array = Object.keys(data);
  date_array.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  var baseline = new Date(date_array[0]);
  var temp = baseline;
  const end = new Date(date_array.at(-1));
  var val = data[baseline.toISOString()];
  while (baseline < end) {
    if (temp.getTime() > baseline.getTime() + 60 * 1000 * source_time_res) {
      baseline = new Date(baseline.getTime() + 60 * 1000 * source_time_res);
      val = data[baseline.toISOString()];
      temp = baseline;
    }
    interpolated_data[temp.toISOString()] = val;
    temp = new Date(temp.getTime() + 60 * 1000 * user_time_res);
  }

  return interpolated_data;
}

module.exports = {
  yearRange: yearRange,
  spacedList: spacedList,
  missingParameterMessage: missingParameterMessage,
  isValidDate: isValidDate,
  parseAlaskaWindResponse: parseAlaskaWindResponse,
  baselineTimeStep: baselineTimeStep,
};
