<template>
  <vueper-slides fade :touchable="false">
    <vueper-slide
      v-for="i in slides"
      :key="i"
      :title="i.title"
      :link="i.link"
      :image="i.image"
    />
  </vueper-slides>
</template>

<script>
import { VueperSlides, VueperSlide } from "vueperslides";
import "vueperslides/dist/vueperslides.css";

export default {
  name: "SourceCarousel",
  components: {
    VueperSlides,
    VueperSlide,
  },
  data() {
    return {
      slides: [
        {
          title: "Wind Power Data",
          link: "http://0.0.0.0:8080/WindTool",
          image: require("../assets/images/thomas-reaubourg-JRUVbgJJTBM-unsplash.jpg"),
        },
        {
          title: "Solar Power Data",
          image: require("../assets/images/american-public-power-association-XGAZzyLzn18-unsplash.jpg"),
        },
      ],
    };
  },
};
</script>
