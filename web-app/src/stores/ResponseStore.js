import { defineStore } from "pinia";

export const useResponseStore = defineStore("ResponseStore", {
  id: "response",
  state: () => {
    return {
      response: {},
    };
  },
  getters: {
    getResponse() {
      return this.response;
    },
  },
  actions: {
    setResponse(res) {
      this.response = res;
    },
  },
});
