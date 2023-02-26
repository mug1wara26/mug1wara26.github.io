<template>
  <v-container fluid>
    <p v-if="user === undefined"> User login not implemented yet, click on a user in search to view their page</p>
    <template v-else>
      <v-row>
        <v-col cols="3">
          <v-card>
            <v-card-title>
              <v-avatar size="56">
                <img
                    alt="user"
                    src="../../public/assets/default-pfp.webp"
                />
              </v-avatar>
              <h3 class="ml-4"> {{ user.username }} </h3>
            </v-card-title>
            <v-card-subtitle class="mt-2"> {{ user.email }} </v-card-subtitle>
            <v-divider/>
            <v-card-text>
              <p> {{ user.bio }} </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import {BasicUser} from "../../cs6131-backend/types/user";

export default Vue.extend({
  name: "Users",
  data() {
    return {
      user: {} as BasicUser
    }
  },
  methods: {
    getUser(username: string) : Promise<BasicUser> {
      return new Promise<BasicUser>((resolve, reject) => {
            fetch(`http://localhost:3000/users/${username}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  }
                }
            ).then(res => res.json()).then(json => {
              resolve(json.data)
            }).catch(err => {
              reject(err);
            })
          }
      )
    }
},
  async created() {
    const username = this.$route.params.username;
    await this.getUser(username).then(user => {
      this.user = user as BasicUser
    })
  }
})
</script>