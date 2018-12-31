<template>
  <v-layout justify-center align-start row>
    <v-flex>
      <v-toolbar dense>
        <v-text-field
          v-model="filter"
          hide-details
          prepend-icon="search"
          single-line
          style="padding:0"
        ></v-text-field>

        <v-btn icon @click="items = []">
          <v-icon>delete</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-list class="pa-0">
          <v-list-tile
            avatar
            v-for="item in filter ? items.filter(a => a.href.includes(filter) ||
                a.data.includes(filter) || a.receiveData.includes(filter)) : items"
            :key="item.id"
            @click="openDialog(item)"
          >
            <v-list-tile-avatar>
              <v-progress-circular
                v-if="!item.status"
                size="40"
                width="3"
                color="primary"
                indeterminate
              >
                <img :src="item.icon || FILE" />
              </v-progress-circular>
              <v-progress-circular
                v-else-if="item.status === 1"
                size="40"
                width="3"
                :color="item.response.statusCode >= 100 && item.response.statusCode < 400
                  ? 'green' : 'red'"
                indeterminate
              >
                <img :src="item.icon || FILE" />
              </v-progress-circular>
              <v-progress-circular
                v-if="item.status === 2"
                size="40"
                width="3"
                value="100"
                :color="!item.error && item.response.statusCode >= 100 && item.response.statusCode < 400
                  ? 'green' : 'red'"
              >
                <img :src="item.icon || FILE" />
              </v-progress-circular>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{item.method}} {{item.name}}</v-list-tile-title>
              <v-list-tile-sub-title v-if="item.time">{{item.time - item.id}}ms - {{item.href}}</v-list-tile-sub-title>
              <v-list-tile-sub-title v-else-if="item.error">{{item.error}} - {{item.href}}</v-list-tile-sub-title>
              <v-list-tile-sub-title v-else>{{item.href}}</v-list-tile-sub-title>
            </v-list-tile-content>

            <v-list-tile-action @click.stop>
              <v-menu bottom left transition="slide-y-transition">
                <v-btn
                  slot="activator"
                  dark
                  icon
                >
                  <v-icon>more_vert</v-icon>
                </v-btn>
                <v-list>
                  <v-list-tile :disabled="!item.data.length" @click="openDataDialog(item.data)">
                    <v-list-tile-action>
                      <v-icon>cloud_upload</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title>查看发送数据</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile :disabled="!item.receiveData.length" @click="openDataDialog(item.receiveData)">
                    <v-list-tile-action>
                      <v-icon>cloud_download</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title>查看接收数据</v-list-tile-title>
                  </v-list-tile>
                  <v-divider />
                  <v-list-tile
                    @click=""
                    v-clipboard:copy="item.href"
                    v-clipboard:success="onCopy"
                    v-clipboard:error="onCopyError"
                  >
                    <v-list-tile-action>
                      <v-icon>file_copy</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title>复制请求地址</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile
                    @click=""
                    v-clipboard:copy="item.nodeCode.code"
                    v-clipboard:success="onCopy"
                    v-clipboard:error="onCopyError"
                  >
                    <v-list-tile-action>
                      <v-icon>file_copy</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title>复制请求代码</v-list-tile-title>
                  </v-list-tile>
                  <v-divider />
                  <v-list-tile :href="item.href" target="_blank">
                    <v-list-tile-action>
                      <v-icon>open_in_new</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title>在新标签页中打开</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile @click="replay(item)">
                    <v-list-tile-action>
                      <v-icon>replay</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title>重新发送请求</v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>
    <v-dialog
      scrollable
      v-model="dialog"
    >
      <v-card>
        <v-card-title class="headline">请求详情</v-card-title>
        <v-card-text>
          <v-treeview :open="[1]" class="treeviewer" :items="treeData">
            <template slot="prepend" slot-scope="{ item }">
              <label v-if="item.title" class="font-weight-bold subheading">{{item.title}}: </label>
            </template>
          </v-treeview>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            flat
            @click="dialog = false"
          >返回</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      scrollable
      :persistent="loading"
      v-model="dataDialog"
    >
      <v-card>
        <v-card-title class="headline r-switch">查看数据
          <v-switch label="显示原始数据" v-model="original" :disabled="loading" />
        </v-card-title>
        <v-card-text>
          <v-progress-linear
            indeterminate
            v-if="loading"
            color="primary"
            class="mb-0"
          ></v-progress-linear>
          <pre v-else>
            <code class="hljs" v-html="original ? showData.originHL : showData.formatedHL"></code>
          </pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            flat
            :disabled="loading"
            v-clipboard:copy="original ? showData.origin : showData.formated"
            v-clipboard:success="onCopy"
            v-clipboard:error="onCopyError"
          >复制文本</v-btn>
          <v-btn
            color="primary"
            flat
            :disabled="loading"
            @click="dataDialog = false"
          >返回</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" right>
      复制{{error ? '失败' : '成功'}}!
      <v-btn
        color="pink"
        flat
        @click="snackbar = false"
      >
        关闭
      </v-btn>
    </v-snackbar>
  </v-layout>
</template>

<script lang="ts" src="./requests-ctrl.ts"></script>

<style>
.treeviewer label+.v-treeview-node__label {
  font-size: 1.1rem;
  font-weight: 300;
}
.r-switch .v-input__slot {
  margin-left: 16px;
  margin-bottom: 8px !important;
}
.v-progress-circular__info img {
  height: 27px;
  margin-top: 7px;
}
code.hljs {
  font-size: 1.05rem;
  font-family: 'Fira Code';
}
code.hljs::before, code.hljs::after {
  content: none;
}
</style>

