<template>
<div id="divLoading">
    <div class="page-center">
        <div class="loadingBox">
            <div class="centered">
                Loading...
            </div>
        </div>
    </div>
</div>
</template>
<script>
export default {
    
}
</script>
<style scoped>
#divLoading {
    margin: 0px;
    padding: 0px;
    position: fixed;
    right: 0px;
    top: 0px;
    width: 100%; height: 100%;
    background-color: #666666;
    z-index: 30001;
    opacity: .9;
    filter: alpha(opacity=90);
}

.page-center {
    display: inline;
    top: 50%;
    left: 50%;
    position: relative;
}

.loadingBox {
  border: 2px solid black;
  border-radius: 20px;
  top: 50%;
  left: 50%;
  margin-top: -150px;
  margin-left: -150px;
  width: 300px;
  height: 100px;
  background-color: white;
}

.centered {
    text-align: center;
}

</style>