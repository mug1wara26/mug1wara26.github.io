<template>
  <v-container fluid class="flex-column align-center d-flex mt-8">
    <h1 v-if="!userExists"> Organise your CTF experience</h1>
    <h1 v-else> Welcome back, {{user.displayName}}</h1>
    <i>For the regular CTF player who loses track of the challenges they are working on</i>
    <ul class="mt-2">
      <b>Features:</b>
      <li>Collaborative note taking</li>
      <li>Order challenges by points, category or difficulty</li>
      <li>Markdown rendering with syntax highlighting</li>
    </ul>

    <v-row class="mt-4 justify-center d-flex">
      <v-btn color="primary" class="mr-4 mb-2" to="/search">
        Search
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn v-if="!userExists" outlined class="mr-4 mb-2" @click="registerDialog">
        Register
        <v-icon>mdi-login</v-icon>
      </v-btn>

      <v-btn color="secondary" class="mr-4 mb-2" to="/feedback">
        Feedback
        <v-icon class="ml-1">mdi-message-alert-outline</v-icon>
      </v-btn>
    </v-row>

  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import {onLogin} from "@/api/userApi";
import {BasicUser} from "../../cs6131-backend/types/userTypes";
import {AlertData} from "@/schemas/alertData";

export default Vue.extend({
  data() {
    return {
      user: {} as BasicUser,
    }
  },
  computed: {
    userExists(): boolean {
      return Object.keys(this.user).length !== 0;
    }
  },
  methods: {
    registerDialog() {
      this.$emit("open-register")
    }
  },
  mounted() {
    onLogin((_: AlertData, user: BasicUser) => {
      if (user) this.user = user;
      else this.user = {} as BasicUser
    })
  }
})
</script>
