<template>
  <v-app id="inspire" dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="mini"
      clipped
      fixed
      app
    >
      <v-list dense>
        <v-list-tile to="/">
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>欢迎页</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/requests">
          <v-list-tile-action>
            <v-icon>cloud_upload</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>请求列表</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Node Network Inspector</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <router-view />
      </v-container>
    </v-content>
    <v-footer app fixed>
      <v-flex
        mx-4
        white--text
        xs12
      >
        &copy;2019 — <strong>Shirasawa</strong>
        <span class="label elevation-7">
          <span class="label-1">版本</span>
          <span class="label-2">{{APP_VERSION}}</span>
        </span>
      </v-flex>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    drawer: null,
    mini: false,
    APP_VERSION: window.APP_VERSION
  })
}
</script>
