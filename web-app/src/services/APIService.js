const axios = require("axios");

export async function getSearchData() {
  const response = await axios.get("/api/");
  return response.data;
}
