<template>
  <v-layout align-center justify-center column>
    <img :src="url" />
    <v-flex>
      <div class="content">
        <p class="headline">欢迎使用</p>
        <p class="display-1">Node Network Inspector</p>
        <div class="labels">
          <v-layout justify-center>
            <a class="elevation-7" href="https://standardjs.com/">
              <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" />
            </a>
            <span class="label elevation-7">
              <span class="label-1">版本</span>
              <span class="label-2">{{APP_VERSION}}</span>
            </span>
            <a class="ml-2 elevation-7" href="https://github.com/ShirasawaSama/node-network-inspector">
              <img src="https://img.shields.io/github/stars/ShirasawaSama/node-network-inspector.svg?label=Stars&style=social" />
            </a>
          </v-layout>
        </div>
        <p class="headline">点击左侧菜单立即开始!</p>
      </div>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Home extends Vue {
  public APP_VERSION = window.APP_VERSION
  public url = process.env.BASE_URL + '192x192.png'
}
</script>

<style>
.content {
  text-align: center;
}
.labels a {
  margin-bottom: 30px;
  height: 20px;
}
.label {
  margin-left: 8px;
  color: #fff;
  height: 23px;
  cursor: default;
}
.label-1 {
  background: #35495e;
  padding: 3px 4px 3px 8px;
  border-radius: 3px 0 0 3px;
}
.label-2 {
  background: #42a5f5;
  padding: 3px 8px 3px 6px;
  border-radius: 0 3px 3px 0;
}
</style>

