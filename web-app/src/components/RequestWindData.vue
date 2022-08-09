<template>
  <div class="flex h-screen justify-center items-center">
    <div class="m-auto">
      <h1 class="text-4xl align-text-top mb-6">Wind Tool</h1>
      <p class="mb-6">
        For information on how to use this tool read the documentation.
      </p>
      <form class="w-2/3 m-auto" @submit.prevent="onSubmit">
        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full md:w-1/2 px-3">
          <label
            class="
              block
              uppercase
              tracking-wide
              text-gray-700 text-xs
              font-bold
              mb-2
            "
            for="lat"
            >Latitude<abbr title="required" aria-label="required">*</abbr>
          </label>
          <input
            class="
              appearance-none
              block
              w-full
              bg-gray-200
              text-gray-700
              border border-gray-200
              rounded
              py-3
              px-4
              leading-tight
              focus:outline-none focus:bg-white focus:border-gray-500
            "
            id="lat"
            name="Latitude"
            v-model="Latitude"
          />
          <p
            class="text-black-500 text-xs italic"
            id="degreeInfo"
            form="form-text text-muted"
          >
            Coordinates are formatted with decimal points, not minutes
          </p>
        </div>
        <div class="w-full md:w-1/2 px-3">
          <label
            class="
              block
              uppercase
              tracking-wide
              text-gray-700 text-xs
              font-bold
              mb-2
            "
            for="lon"
            >Longitude<abbr title="required" aria-label="required"
              >*</abbr
            ></label
          >
          <input
            class="
              appearance-none
              block
              w-full
              bg-gray-200
              text-gray-700
              border border-gray-200
              rounded
              py-3
              px-4
              leading-tight
              focus:outline-none focus:bg-white focus:border-gray-500
            "
            id="lon"
            name="Longitude"
            v-model="Longitude"
          />
          <small
            class="text-black-500 text-xs italic"
            id="degreeInfo"
            form="form-text text-muted"
            >Coordinates are formatted with decimal points, not minutes</small
          >
        </div>
      </div>
      <div class="flex flex-wrap -mx-3 mb-6">
        <div class="w-full md:w-1/2 px-3">
          <label
            class="
              block
              uppercase
              tracking-wide
              text-gray-700 text-xs
              font-bold
              mb-2
            "
            for="hub"
            >Hub Height<abbr title="required" aria-label="required"
              >*</abbr
            ></label
          >
          <input
            class="
              appearance-none
              block
              w-full
              bg-gray-200
              text-gray-700
              border border-gray-200
              rounded
              py-3
              px-4
              mb-3
              leading-tight
              focus:outline-none focus:bg-white focus:border-gray-500
            "
            id="hub"
            name="HubHeight"
            v-model="HubHeight"
          />
          <p
            class="text-gray-600 text-xs italic"
            id="unitInfo"
            form="form-text text-muted"
          >
            Height of turbine above the ground in meters
          </p>
        </div>
        <div class="w-full md:w-1/2 px-3">
          <label
            class="
              block
              uppercase
              tracking-wide
              text-gray-700 text-xs
              font-bold
              mb-2
            "
            for="windSurface"
            >Wind Surface<abbr title="required" aria-label="required"
              >*</abbr
            ></label
          >
          <div class="relative">
            <select
              class="
                block
                appearance-none
                w-full
                bg-gray-200
                border border-gray-200
                text-gray-700
                py-3
                px-4
                pr-8
                rounded
                leading-tight
                focus:outline-none focus:bg-white focus:border-gray-500
              "
              id="windSurface"
              name="WindSurface"
              v-model="WindSurface"
            >
              <option value="unknown">unknown</option>
              <option value="vegtype_1">vegtype_1</option>
              <option value="vegtype_2">vegtype_2</option>
              <option value="vegtype_3">vegtype_3</option>
              <option value="vegtype_4">vegtype_4</option>
              <option value="vegtype_5">vegtype_5</option>
              <option value="vegtype_6">vegtype_6</option>
              <option value="vegtype_7">vegtype_7</option>
              <option value="vegtype_8">vegtype_8</option>
              <option value="vegtype_9">vegtype_9</option>
              <option value="vegtype_10">vegtype_10</option>
              <option value="vegtype_11">vegtype_11</option>
              <option value="vegtype_12">vegtype_12</option>
              <option value="vegtype_20">vegtype_20</option>
              <option value="seaice">seaice</option>
              <option value="openwater">openwater</option>
              <option value="airportice">airportice</option>
              <option value="airportgrass">airportgrass</option>
            </select>
            <div
              class="
                pointer-events-none
                absolute
                inset-y-0
                right-0
                flex
                items-center
                px-2
                text-gray-700
              "
            >
              <svg
                class="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                />
              </svg>
            </div>
          </div>
          <small
            class="text-black-500 text-xs italic"
            id="windSurfaceInfo"
            form="form-text text-muted"
            >Based on the NASA Corrected Wind Speed calculation. Specifications
            can be found
            <a
              href="https://power.larc.nasa.gov/docs/methodology/meteorology/wind/#corrected-wind-speed"
              >here.</a
            ></small
          >
        </div>
      </div>
      <div class="flex flex-wrap -mx-3 mb-6">
        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label
            class="
              block
              uppercase
              tracking-wide
              text-gray-700 text-xs
              font-bold
              mb-2
            "
            for="startDate"
            >Start Date<abbr title="required" aria-label="required"
              >*</abbr
            ></label
          >
          <input
            class="
              appearance-none
              block
              w-full
              bg-gray-200
              text-gray-700
              border border-gray-200
              rounded
              py-3
              px-4
              leading-tight
              focus:outline-none focus:bg-white focus:border-gray-500
            "
            id="startDate"
            name="start"
            type="date"
            v-model="start"
          />
        </div>
        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label
            class="
              block
              uppercase
              tracking-wide
              text-gray-700 text-xs
              font-bold
              mb-2
            "
            for="endDate"
            >End Date<abbr title="required" aria-label="required"
              >*</abbr
            ></label
          >
          <input
            class="
              appearance-none
              block
              w-full
              bg-gray-200
              text-gray-700
              border border-gray-200
              rounded
              py-3
              px-4
              leading-tight
              focus:outline-none focus:bg-white focus:border-gray-500
            "
            id="endDate"
            name="end"
            type="date"
            v-model="end"
          />
        </div>
      </div>
      <div
        tabindex="0"
        class="
          collapse collapse-arrow
          border border-base-300
          bg-base-100
          rounded-box
          mb-4
        "
      >
        <input type="checkbox" class="peer" />
        <div class="collapse-title text-m font-medium">
          Open Weather (Experimental)
        </div>
        <div class="collapse-content" id="collapseWeather">
          <div class="card card-body">
            <p>
              Currently Open Weather support is limited. It is not enabled by
              default, because a historical query requires multiple API calls.
              As a result, for large periods of time with small time sets,
              limits can be met incredibly quickly. If this app is being run in
              a development environment, then <b>your</b> API key is being used
              for this, so be careful.
              <b>Each time step results in an API call</b>
            </p>
            <div class="mb-3 form-check">
              <input
                name="openWeather"
                type="checkbox"
                class="mr-2 form-check-input"
                id="weatherCheck"
                v-model="openWeather"
              />
              <label class="form-check-label" for="weatherCheck"
                >Access Open Weather Data</label
              >
            </div>
            <div class="mb-3">
              <label for="timeStep" class="form-label">Time Step</label>
              <div class="flex justify-center">
                <input
                  name="timeStep"
                  id="timeStep"
                  type="number"
                  class="
                    appearance-none
                    block
                    w-1/3
                    bg-gray-200
                    text-gray-700
                    border border-gray-200
                    rounded
                    py-3
                    px-4
                    mb-3
                    focus:outline-none focus:bg-white focus:border-gray-500
                  "
                  v-model="timeStep"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <input class="btn btn-primary" type="submit" value="Submit" />
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useResponseStore } from "@/stores/ResponseStore";
export default {
  name: "RequestWindData",
  props: {
    msg: String,
  },
  data() {
    return {
      Latitude: null,
      Longitude: null,
      HubHeight: null,
      WindSurface: '',
      start: '',
      end: '',
      openWeather: null,
      timeStep: null,
    }
  },
  emits: ["response-received", "request-received"],
  methods: {
    onSubmit() {
      const main = useResponseStore()
      this.$emit("request-received");
      let body = {
        Latitude: this.Latitude,
        Longitude: this.Longitude,
        HubHeight: this.HubHeight,
        WindSurface: this.WindSurface,
        start: this.start,
        end: this.end,
        openWeather: this.openWeather,
        timeStep: this.timeStep
      }
      axios.post("/api/search", body).then((response) => {
        this.$emit("response-received");
        main.setResponse(response);
      }).catch((error) => {
        this.$emit("responseReceived");
        main.setResponse(error);
        console.error(error);
      })
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
