import Vue from 'vue'
import io from 'socket.io-client'
import VueSocketIO from 'vue-socket.io-extended'

Vue.use(VueSocketIO, io())
