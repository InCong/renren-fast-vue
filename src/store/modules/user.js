export default {
  namespaced: true,
  state: {
    id: 0,
    name: '',
    headImgUrl: '',
    bdOrgId: -1,
    orgName: ''
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
    },
    updateBdOrgId (state, bdOrgId) {
      state.bdOrgId = bdOrgId
    },
    updateOrgName (state, orgName) {
      state.orgName = orgName
    }
  }
}
