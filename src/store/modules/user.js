export default {
  namespaced: true,
  state: {
    id: 0,
    name: '',
    headImgUrl: ''
  },
  mutations: {
    updateId (state, id) {
      state.id = id
    },
    updateName (state, name) {
      state.name = name
    },
    updateHeadImgUrl (state, headImgUrl) {
      state.headImgUrl = headImgUrl
    }
  }
}
